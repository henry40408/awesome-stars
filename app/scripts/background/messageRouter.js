import { Router } from 'chomex'
import ChromePromise from 'chrome-promise/constructor'

import DIConstants from '../constants'

class MessageRouter {
  constructor (ctx) {
    /** @type {AccessTokenRepository} */
    this.accessToken = ctx[DIConstants.R_ACCESS_TOKEN]

    /** @type {GithubService} */
    this.github = ctx[DIConstants.S_GITHUB]

    /** @type {ChromeStorageService} */
    this.storage = ctx[DIConstants.S_CHROME_STORAGE]

    this.chromePromise = new ChromePromise()
    this.log = ctx[DIConstants.LOG]
    this.messageRouter = new Router()

    this.registerAll()
    this.github.fetchRateLimitAsync()
  }

  register (route, fn) {
    return this.messageRouter.on(route, async (message) => {
      this.log('📣', route, 'called with', message)
      return fn(message)
    })
  }

  registerAll () {
    this.register('/access-token/get', async () => this.accessToken.loadAsync())

    this.register('/access-token/set', async (message) => {
      let { accessToken: token } = message
      return this.accessToken.saveAsync(token)
    })

    this.register('/awesome-list/check', async (message) => {
      let { owner, name } = message

      let tabs = await this.chromePromise.tabs.query({ active: true })
      if (tabs.length > 0) {
        let { id } = tabs[0]
        chrome.pageAction.show(id)
      }

      return this.github.isAwesomeListAsync({ owner, name })
    })

    this.register('/rate-limit', async () => this.github.fetchRateLimitAsync())

    this.register('/stars/get/batch', async (message) => {
      let { tuples } = message
      return this.github.fetchMultipleStarCountAsync(tuples)
    })

    this.register('/update-notification-sent/get', async () =>
      this.storage.loadAsync(this.storage.KEY_UPDATE_NOTIFICATION_SENT)
    )

    this.register('/update-notification-sent/set', async (message) => {
      let { updateNotificationSent } = message
      return this.storage.saveAsync(
        this.storage.KEY_UPDATE_NOTIFICATION_SENT,
        updateNotificationSent
      )
    })

    this.register('/apply-on-github-issues/get', async () =>
      this.storage.loadAsync(this.storage.KEY_APPLY_ON_GITHUB_ISSUES, false)
    )

    this.register('/apply-on-github-issues/set', async (message) => {
      let { applyOnGithubIssues } = message
      return this.storage.saveAsync(
        this.storage.KEY_APPLY_ON_GITHUB_ISSUES,
        applyOnGithubIssues
      )
    })
  }

  start () {
    chrome.runtime.onMessage.addListener(this.messageRouter.listener())
  }
}

export default MessageRouter
