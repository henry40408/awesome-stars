import DIConstants from '../constants'

class AccessTokenRepository {
  KEY_ACCESS_TOKEN = 'ACCESS_TOKEN'

  constructor (ctx) {
    /** @type {ChromeStorageService} */
    this.storage = ctx[DIConstants.S_CHROME_STORAGE]

    this.changed = false
  }

  /**
   * @return {Promise<string|null>}
   */
  async loadAsync () {
    return this.storage.loadAsync(this.KEY_ACCESS_TOKEN, '')
  }

  /**
   * @param {string} accessToken
   */
  async saveAsync (accessToken) {
    await this.storage.saveAsync(this.KEY_ACCESS_TOKEN, accessToken)
    this.changed = true
  }
}

export default AccessTokenRepository
