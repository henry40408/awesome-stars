import axios from 'axios/index';
import numeral from 'numeral';

import DIConstants from '../constants';

class GithubService {
  AWESOME_LIST_URL = 'https://raw.githubusercontent.com/sindresorhus/awesome/master/readme.md';

  AWESOME_LIST_KEY = '@@awesome-list';
  GITHUB_KEY = '@@github';

  constructor(ctx) {
    this.log = ctx[DIConstants.LOG];
    this.updateBadge = ctx[DIConstants.UPDATE_BADGE];

    /** @type {AccessTokenRepository} */
    this.accessToken = ctx[DIConstants.R_ACCESS_TOKEN];

    /** @type {CacheService} */
    this.cache = ctx[DIConstants.S_CACHE];
  }

  /**
   * @return {Promise<AxiosInstance>}
   */
  async buildClient() {
    /** @type {string} */
    const token = await this.accessToken.loadAsync();

    /** @type {AxiosInstance} */
    let client = this.cache.get(this.GITHUB_KEY);

    if (this.accessToken.changed || !client) {
      const params = {};
      if (token) {
        params.access_token = token;
      }

      client = axios.create({ baseURL: 'https://api.github.com', params });
      this.cache.set(this.GITHUB_KEY, client);
      this.accessToken.changed = false;
    }

    return client;
  }

  async fetchAwesomeListAsync() {
    /** @type {string} */
    let awesomeList = this.cache.get(this.AWESOME_LIST_KEY);

    if (!awesomeList) {
      const response = await fetch(this.AWESOME_LIST_URL);
      awesomeList = await response.text();
      this.cache.set(this.AWESOME_LIST_KEY, awesomeList);
    }

    const awesomeListSize = (awesomeList.length / 1024).toFixed(3);
    this.log('fetch awesome list', awesomeListSize, 'KB(s) from cache');

    return awesomeList;
  }

  async fetchRateLimitAsync() {
    const client = await this.buildClient();

    try {
      const response = await client.get('/rate_limit');
      const { rate: { remaining, limit } } = response.data;

      this.log('rate limit:', { remaining, limit });

      const textFormat = remaining < 1000 ? '0a' : '0.0a';
      const badgeText = numeral(remaining).format(textFormat);
      this.updateBadge(badgeText);

      return { remaining, limit };
    } catch (e) {
      this.updateBadge(null);
      return { remaining: -1, limit: -1 };
    }
  }

  async fetchStarCountAsync(owner, name) {
    const client = await this.buildClient();

    const cacheKey = `/repos/${owner}/${name}`;
    let repo = this.cache.get(cacheKey);

    if (!repo) {
      try {
        const response = await client.get(`/repos/${owner}/${name}`);
        repo = response.data;
        this.log('fetch repository from github', repo);
        this.cache.set(cacheKey, repo);
      } catch (e) {
        this.updateBadge(null);
        return -1;
      }
    } else {
      this.log('fetch repository from cache', repo);
    }

    const { stargazers_count } = repo;
    return parseInt(stargazers_count, 10);
  }
}

export default GithubService;
