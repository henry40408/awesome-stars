import axios from 'axios/index'
import includes from 'lodash/includes'

import DIConstants from '../constants'

class GithubService {
  AWESOME_LIST_URL = 'https://raw.githubusercontent.com/sindresorhus/awesome/master/readme.md'

  AWESOME_LIST_KEY = '@@awesome-list'

  RATE_LIMIT_THRESHOLD = 0.5

  constructor (ctx) {
    this.log = ctx[DIConstants.LOG]

    /** @type {AccessTokenRepository} */
    this.accessToken = ctx[DIConstants.R_ACCESS_TOKEN]

    /** @type {CacheService} */
    this.cache = ctx[DIConstants.S_CACHE]

    /** @type {ContextMenuService} */
    this.contextMenu = ctx[DIConstants.S_CONTEXT_MENU]

    /** @type {AxiosInstance} */
    this.client = null
  }

  async buildClient () {
    /** @type {string} */
    let token = await this.accessToken.loadAsync()

    if (!this.client || this.accessToken.changed) {
      let headers = {}
      if (token) {
        headers = { Authorization: `Bearer ${token}` }
      }

      this.client = axios.create({
        baseURL: 'https://api.github.com',
        headers
      })
      this.accessToken.changed = false
    }
  }

  async fetchAwesomeListAsync () {
    /** @type {string} */
    let awesomeList = this.cache.get(this.AWESOME_LIST_KEY)

    if (!awesomeList) {
      let response = await axios.get(this.AWESOME_LIST_URL)

      awesomeList = response.data

      this.cache.set(this.AWESOME_LIST_KEY, awesomeList)
    }

    let awesomeListSize = (awesomeList.length / 1024).toFixed(3)
    this.log('📄 fetch awesome list', awesomeListSize, 'KB(s) from cache')

    return awesomeList
  }

  async fetchRateLimitAsync () {
    await this.buildClient()

    let numberFormatter = new Intl.NumberFormat('en-US')
    let percentFormatter = new Intl.NumberFormat('en-US', { style: 'percent' })

    let query = `query {
      rateLimit {
        remaining
        limit
      }
    }`
    let response = await this.client.post('/graphql', { query })
    let { data: { rateLimit: { remaining, limit } } } = response.data

    this.log('🚦 rate limit:', { remaining, limit })

    let title = chrome.i18n.getMessage('menuRateLimit', [
      numberFormatter.format(remaining),
      numberFormatter.format(limit),
      percentFormatter.format(remaining / limit)
    ])
    this.contextMenu.upsert(this.contextMenu.MENU_RATE_LIMIT, { title })

    return { remaining, limit }
  }

  async fetchMultipleStarCountAsync (tuples) {
    // threshold to prevent the extension to use all rate limit
    let { remaining, limit } = await this.fetchRateLimitAsync()
    if (
      remaining === -1 || limit === -1 ||
      limit === 0 ||
      remaining / limit <= this.RATE_LIMIT_THRESHOLD
    ) {
      throw new Error(
        `rate limit ${remaining}/${limit} is below threshold ${this.RATE_LIMIT_THRESHOLD}`
      )
    }

    let cues = GithubService.tuplesToCues(tuples)
    let query = GithubService.cuesToGraphQLQuery(cues)

    // unwrap response body from axios result first,
    // then unwrap data payload from GraphQL result
    let { data: { data } } = await this.client.post('/graphql', { query })

    if (process.env.NODE_ENV === 'development') {
      let entries = Object.entries(data).filter(tuple => !!tuple[1])
      this.log('🌀', entries.length, 'repositorie(s) fetched')
    }

    return this.graphQLToTuples(cues, data)
  }

  async isAwesomeListAsync ({ owner, name }) {
    let awesomeList = await this.fetchAwesomeListAsync()
    return includes(awesomeList, `${owner}/${name}`)
  }

  static tuplesToCues (tuples) {
    return tuples.map((tuple, index) => ({ alias: `repository${index}`, ...tuple }))
  }

  static cuesToGraphQLQuery (cues) {
    return `query {
      ${cues.map(GithubService.cueToGraphQLQuery).join('\n')}
    }`
  }

  static cueToGraphQLQuery (cue) {
    let { alias, owner, name } = cue
    return `${alias}: repository(owner: "${owner}", name: "${name}") {
      owner { login }
      name
      stargazers { totalCount }
    }`
  }

  async graphQLToTuples (cues, data) {
    return Promise.all(cues.map(async cue => {
      let { alias, owner, name } = cue

      if (data[alias]) {
        let { stargazers: { totalCount } } = data[alias]
        return { owner, name, star: totalCount }
      }

      // repository not found, possibly renamed
      return {
        owner,
        name,
        star: await this.fallbackToRESTful(owner, name)
      }
    }))
  }

  async fallbackToRESTful (owner, name) {
    this.log('🆖 missing repository', owner, name, 'found, fallback to RESTful')
    let { data } = await this.client.get(`/repos/${owner}/${name}`)
    let { stargazers_count: stargazersCount } = data
    return parseInt(stargazersCount, 10)
  }
}

export default GithubService
