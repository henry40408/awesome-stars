import get from 'lodash/get'
import ChromePromise from 'chrome-promise'
import DIConstants from '../constants'

class ChromeStorageService {
  KEY_UPDATE_NOTIFICATION_SENT = 'UPDATE_NOTIFICATION_SENT'
  KEY_APPLY_ON_GITHUB_ISSUES = 'APPLY_ON_GITHUB_ISSUES'

  /**
   * @param {AwilixContainer.cradle} ctx
   */
  constructor (ctx) {
    this.log = ctx[DIConstants.LOG]
    this.chromePromise = new ChromePromise()
  }

  /**
   * @param {string} key
   * @param {*} defaultValue
   * @return {Promise<*>}
   */
  async loadAsync (key, defaultValue = null) {
    const valueInStorage = await this.chromePromise.storage.local.get(key)
    const valueOrDefaultValue = get(valueInStorage, key, defaultValue)
    this.log('load', key, 'from Chrome storage:', valueOrDefaultValue)
    return valueOrDefaultValue
  }

  /**
   * @param {string} key
   * @param {*} value
   * @return {Promise<void>}
   */
  async saveAsync (key, value) {
    const payload = {[key]: value}
    this.log('save', key, 'to Chrome storage:', value)
    return this.chromePromise.storage.local.set(payload)
  }
}

export default ChromeStorageService
