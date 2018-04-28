import * as awilix from 'awilix'

import { log } from './common'
import DIConstants from './constants'

import { version } from '../../package.json'
import AccessTokenRepository from './background/accessTokenRepository'
import CacheService from './background/cacheService'
import ChromeStorageService from './background/chromeStorageService'
import ContextMenuService from './background/contextMenuService'
import GithubService from './background/githubService'
import MessageRouter from './background/messageRouter'

if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line global-require,import/no-extraneous-dependencies
  require('chromereload/devonly')
}

/** @type {AwilixContainer} */
const container = awilix.createContainer({
  injectionMode: awilix.InjectionMode.PROXY
})

container.register({
  [DIConstants.LOG]: awilix.asValue(log),
  [DIConstants.MESSAGE_ROUTER]: awilix.asClass(MessageRouter).singleton(),
  [DIConstants.R_ACCESS_TOKEN]: awilix.asClass(AccessTokenRepository).singleton(),
  [DIConstants.S_CACHE]: awilix.asClass(CacheService).singleton(),
  [DIConstants.S_CHROME_STORAGE]: awilix.asClass(ChromeStorageService),
  [DIConstants.S_CONTEXT_MENU]: awilix.asClass(ContextMenuService).singleton(),
  [DIConstants.S_GITHUB]: awilix.asClass(GithubService)
})

/** @type {ChromeStorageService} */
const storageService = container.resolve(DIConstants.S_CHROME_STORAGE)

/** @type {MessageRouter} */
const messageRouter = container.resolve(DIConstants.MESSAGE_ROUTER)

/** @type {ContextMenuService} */
const contextMenuService = container.resolve(DIConstants.S_CONTEXT_MENU)

async function applyOnGithubIssuesClickListener () {
  const checked = !await storageService.loadAsync(storageService.KEY_APPLY_ON_GITHUB_ISSUES)
  await storageService.saveAsync(storageService.KEY_APPLY_ON_GITHUB_ISSUES, checked)
  contextMenuService.upsert(contextMenuService.MENU_APPLY_ON_GITHUB_ISSUES, {checked})
}

async function initializeExtensionAsync () {
  chrome.runtime.onInstalled.addListener(async (reason, previousVersion) => {
    const isUpdate = reason === 'update' && previousVersion !== version

    if (process.env.NODE_ENV === 'development') {
      chrome.runtime.openOptionsPage()
    }

    // reset update notification state...
    // 1. in development environment
    // 2. when extension is successfully upgraded
    if (process.env.NODE_ENV === 'development' || isUpdate) {
      return storageService.saveAsync(storageService.KEY_UPDATE_NOTIFICATION_SENT, false)
    }

    return true
  })

  const checked = !!await storageService.loadAsync(storageService.KEY_APPLY_ON_GITHUB_ISSUES)

  contextMenuService.upsert(contextMenuService.MENU_RATE_LIMIT, {
    type: 'normal',
    contexts: ['page_action'],
    title: 'Rate Limit: N/A',
    enabled: false
  })

  contextMenuService.upsert(contextMenuService.MENU_APPLY_ON_GITHUB_ISSUES, {
    type: 'checkbox',
    title: chrome.i18n.getMessage('applyOnGithubIssues'),
    contexts: ['page_action'],
    onclick: applyOnGithubIssuesClickListener,
    checked
  })
}

function main () {
  initializeExtensionAsync()
  messageRouter.start()
}

main()
