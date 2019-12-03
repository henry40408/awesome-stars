import ChromePromise from 'chrome-promise/constructor'
import get from 'lodash/get'

import DIConstants from '../constants'

class ChromeStorageService {
  KEY_UPDATE_NOTIFICATION_SENT = 'UPDATE_NOTIFICATION_SENT'
  KEY_APPLY_ON_GITHUB_ISSUES = 'APPLY_ON_GITHUB_ISSUES'
  KEY_APPLY_ON_ALL_AWESOME_LIST = 'APPLY_ON_ALL_AWESOME_LIST'

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
    let valueInStorage = await this.chromePromise.storage.local.get(key)
    let valueOrDefaultValue = get(valueInStorage, key, defaultValue)
    this.log('📤 load', key, 'from Chrome storage:', valueOrDefaultValue)
    return valueOrDefaultValue
  }

  /**
   * @param {string} key
   * @param {*} value
   * @return {Promise<void>}
   */
  async saveAsync (key, value) {
    let payload = { [key]: value }
    this.log('📥 save', key, 'to Chrome storage:', value)
    return this.chromePromise.storage.local.set(payload)
  }
}

export default ChromeStorageService
