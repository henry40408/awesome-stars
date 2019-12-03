import ApolloClient from 'apollo-boost'
import { cacheAdapterEnhancer } from 'axios-extensions'
import axios from 'axios/index'
import gql from 'graphql-tag'
import includes from 'lodash/includes'
import set from 'lodash/set'
import LRU from 'lru-cache'

import DIConstants from '../constants'

class GithubService {
  AWESOME_LIST_URL = 'https://raw.githubusercontent.com/sindresorhus/awesome/master/readme.md'
  LRU_MAX_AGE = 60 * 60 * 1000 // = 1 hour
  RATE_LIMIT_THRESHOLD = 0.5

  constructor (ctx) {
    this.log = ctx[DIConstants.LOG]

    /** @type {AccessTokenRepository} */
    this.accessToken = ctx[DIConstants.R_ACCESS_TOKEN]

    /** @type {ContextMenuService} */
    this.contextMenu = ctx[DIConstants.S_CONTEXT_MENU]

    /** @type {ChromeStorageService} */
    this.storage = ctx[DIConstants.S_CHROME_STORAGE]

    /** @type {ApolloClient} */
    this.apolloClient = null

    /** @type {AxiosInstance} */
    this.restfulClient = null

    let defaultCache = LRU({ maxAge: this.LRU_MAX_AGE })

    /** @type {AxiosInstance} */
    this.rawRestfulClient = axios.create({
      baseURL: `https://api.github.com`,
      adapter: cacheAdapterEnhancer(axios.defaults.adapter, { defaultCache })
    })
  }

  async _buildClients () {
    /** @type {string} */
    let token = await this.accessToken.loadAsync()

    if (!this.apolloClient || !this.restfulClient || this.accessToken.changed) {
      let headers = {}
      let request = async () => {}

      if (token) {
        headers = { ...headers, Authorization: `Bearer ${token}` }
        request = async operation => operation.setContext({ headers })
      }

      // suppress any GraphQL errors
      let onError = ({ response }) => set(response, 'errors', [])

      /** @type {ApolloClient} */
      this.apolloClient = new ApolloClient({
        uri: 'https://api.github.com/graphql',
        request,
        onError
      })

      let defaultCache = LRU({ maxAge: this.LRU_MAX_AGE })

      /** @type {AxiosInstance} */
      this.restfulClient = axios.create({
        baseURL: 'https://api.github.com',
        headers,
        adapter: cacheAdapterEnhancer(axios.defaults.adapter, { defaultCache })
      })

      this.accessToken.changed = false
    }
  }

  async fetchAwesomeListAsync () {
    let { data: awesomeList } = await this.rawRestfulClient.get(this.AWESOME_LIST_URL)
    let awesomeListSize = (awesomeList.length / 1024).toFixed(3)
    this.log('📄 fetch awesome list', awesomeListSize, 'KB(s)')
    return awesomeList
  }

  async fetchRateLimitAsync () {
    await this._buildClients()

    let numberFormatter = new Intl.NumberFormat('en-US')
    let percentFormatter = new Intl.NumberFormat('en-US', { style: 'percent' })

    let { remaining, limit } = await this.selectRateLimitAsync()
    this.log('🚦 rate limit:', { remaining, limit })

    let title = chrome.i18n.getMessage('menuRateLimit', [
      numberFormatter.format(remaining),
      numberFormatter.format(limit),
      percentFormatter.format(remaining / limit)
    ])
    this.contextMenu.upsert(this.contextMenu.MENU_RATE_LIMIT, { title })

    return { remaining, limit }
  }

  async selectRateLimitAsync () {
    let [graphql, restful] = await Promise.all([
      this._fetchGraphQLRateLimitAsync(),
      this._fetchRESTfulRateLimitAsync()
    ])

    let { remaining: restfulRemaining } = restful
    let { remaining: graphqlRemaining } = graphql
    let { remaining, limit } = restfulRemaining < graphqlRemaining ? restful : graphql

    return { remaining, limit }
  }

  async _fetchGraphQLRateLimitAsync () {
    let query = gql`query RateLimit { rateLimit { remaining limit } }`
    let response = await this.apolloClient.query({ query })
    let { rateLimit: { remaining, limit } } = response.data
    return { remaining, limit }
  }

  async _fetchRESTfulRateLimitAsync () {
    let response = await this.restfulClient.get('/rate_limit')
    let { rate: { remaining, limit } } = response.data
    return { remaining, limit }
  }

  async fetchMultipleStarCountAsync (tuples) {
    await this._checkRateLimitAsync()

    let cues = GithubService._buildCuesFromTuples(tuples)
    let query = GithubService._buildGraphQLQueryFromCues(cues)

    let { data } = await this.apolloClient.query({ query })

    if (process.env.NODE_ENV === 'development') {
      let entries = Object.entries(data).filter(tuple => !!tuple[1])
      this.log('🌀', entries.length, 'repositorie(s) fetched')
    }

    return this._buildTuplesFromGraphQLResponseAsync(cues, data)
  }

  async _checkRateLimitAsync () {
    // threshold to prevent the extension to use all rate limit
    let { remaining, limit } = await this.fetchRateLimitAsync()
    if (limit === 0 || remaining / limit <= this.RATE_LIMIT_THRESHOLD) {
      throw new Error(
        `rate limit ${remaining}/${limit} is below threshold ${this.RATE_LIMIT_THRESHOLD}`
      )
    }
  }

  static _buildCuesFromTuples (tuples) {
    return tuples.map((tuple, index) => ({ alias: `repository${index}`, ...tuple }))
  }

  static _buildGraphQLQueryFromCues (cues) {
    return gql`query Repositories {
      ${cues.map(GithubService._buildGraphQLFromCue).join('\n')}
    }`
  }

  static _buildGraphQLFromCue (cue) {
    let { alias, owner, name } = cue
    return `${alias}: repository(owner: "${owner}", name: "${name}") {
      owner { login }
      name
      stargazers { totalCount }
    }`
  }

  async _buildTuplesFromGraphQLResponseAsync (cues, data) {
    return Promise.all(cues.map(async cue => {
      let { alias, owner, name } = cue

      if (data[alias]) {
        let { stargazers: { totalCount } } = data[alias]
        return { owner, name, star: totalCount }
      }

      // repository not found, possibly renamed
      let maybeStar = await this._fetchStarCountFromRESTfulAPIAsync(owner, name)
      return { owner, name, ...maybeStar }
    }))
  }

  async _fetchStarCountFromRESTfulAPIAsync (owner, name) {
    try {
      this.log('🆖 missing repository', owner, name, 'found, fallback to RESTful')
      let response = await this.restfulClient.get(`https://api.github.com/repos/${owner}/${name}`)
      let { data } = response
      let { stargazers_count: stargazersCount } = data
      return { star: parseInt(stargazersCount, 10) }
    } catch (error) {
      return { error: error.message }
    }
  }

  async isAwesomeListAsync ({ owner, name }) {
    const applyOnAllAwesomeList = await this.storage.loadAsync(this.storage.KEY_APPLY_ON_ALL_AWESOME_LIST)
    if (applyOnAllAwesomeList) {
      return name.toLowerCase().includes('awesome')
    }
    let awesomeList = await this.fetchAwesomeListAsync()
    return includes(awesomeList, `${owner}/${name}`)
  }
}

export default GithubService
