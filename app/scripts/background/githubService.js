import axios from 'axios/index'
import includes from 'lodash/includes'

import DIConstants from '../constants'
import { logError } from '../common'

class GithubService {
  AWESOME_LIST_URL = 'https://raw.githubusercontent.com/sindresorhus/awesome/master/readme.md'

  AWESOME_LIST_KEY = '@@awesome-list'
  GITHUB_KEY = '@@github'

  RATE_LIMIT_THRESHOLD = 0.5

  constructor (ctx) {
    this.log = ctx[DIConstants.LOG]

    /** @type {AccessTokenRepository} */
    this.accessToken = ctx[DIConstants.R_ACCESS_TOKEN]

    /** @type {CacheService} */
    this.cache = ctx[DIConstants.S_CACHE]

    /** @type {ContextMenuService} */
    this.contextMenu = ctx[DIConstants.S_CONTEXT_MENU]
  }

  /**
   * @return {Promise<AxiosInstance>}
   */
  async buildClient () {
    /** @type {string} */
    let token = await this.accessToken.loadAsync()

    /** @type {AxiosInstance} */
    let client = this.cache.get(this.GITHUB_KEY)

    if (this.accessToken.changed || !client) {
      let headers = {}
      if (token) {
        headers = { Authorization: `Bearer ${token}` }
      }

      client = axios.create({ baseURL: 'https://api.github.com', headers })

      this.cache.set(this.GITHUB_KEY, client)
      this.accessToken.changed = false
    }

    return client
  }

  async fetchAwesomeListAsync () {
    /** @type {string} */
    let awesomeList = this.cache.get(this.AWESOME_LIST_KEY)

    if (!awesomeList) {
      let response = await axios.get(this.AWESOME_LIST_URL)

      awesomeList = await response.text()

      this.cache.set(this.AWESOME_LIST_KEY, awesomeList)
    }

    let awesomeListSize = (awesomeList.length / 1024).toFixed(3)
    this.log('📄 fetch awesome list', awesomeListSize, 'KB(s) from cache')

    return awesomeList
  }

  async fetchRateLimitAsync () {
    let client = await this.buildClient()

    let numberFormatter = new Intl.NumberFormat('en-US')
    let percentFormatter = new Intl.NumberFormat('en-US', { style: 'percent' })

    try {
      let response = await client.get('/rate_limit')
      let { rate: { remaining, limit } } = response.data

      this.log('🚦 rate limit:', { remaining, limit })

      let title = chrome.i18n.getMessage('menuRateLimit', [
        numberFormatter.format(remaining),
        numberFormatter.format(limit),
        percentFormatter.format(remaining / limit)
      ])
      this.contextMenu.upsert(this.contextMenu.MENU_RATE_LIMIT, { title })

      return { remaining, limit }
    } catch (e) {
      logError(e)
      return { remaining: -1, limit: -1 }
    }
  }

  async fetchMultipleStarCountAsync (tuples) {
    for (let tuple of tuples) {
      let { owner, name } = tuple
      let starCount = await this.fetchStarCountAsync(owner, name)
      tuple.star = starCount
    }
    return tuples
  }

  async fetchStarCountAsync (owner, name) {
    // threshold to prevent the extension use all rate limit
    let { remaining, limit } = await this.fetchRateLimitAsync()
    if (
      remaining === -1 || limit === -1 ||
      limit === 0 ||
      remaining / limit <= this.RATE_LIMIT_THRESHOLD
    ) {
      return -1
    }

    let client = await this.buildClient()

    let cacheKey = `/repos/${owner}/${name}`
    let repo = this.cache.get(cacheKey)

    if (!repo) {
      try {
        let response = await client.get(`/repos/${owner}/${name}`)
        repo = response.data
        this.log('🌍 fetch repository from Github', repo)
        this.cache.set(cacheKey, repo)
      } catch (e) {
        logError(e)
        this.contextMenu.upsert(this.contextMenu.MENU_RATE_LIMIT, {
          title: chrome.i18n.getMessage('menuRateLimit', ['?', '?', 'N/A'])
        })
        return -1
      }
    } else {
      this.log('🗄 fetch repository from️ cache', repo)
    }

    let { stargazers_count: stargazersCount } = repo
    return parseInt(stargazersCount, 10)
  }

  async isAwesomeListAsync ({ owner, name }) {
    let awesomeList = await this.fetchAwesomeListAsync()
    return includes(awesomeList, `${owner}/${name}`)
  }
}

export default GithubService
