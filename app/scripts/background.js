import * as awilix from 'awilix';

import { log, updateBadge } from './common';
import DIConstants from './constants';

import { version } from '../../package.json';
import AccessTokenRepository from './background/accessTokenRepository';
import CacheService from './background/cacheService';
import ChromeStorageService from './background/chromeStorageService';
import GithubService from './background/githubService';
import MessageRouter from './background/messageRouter';

if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line global-require,import/no-extraneous-dependencies
  require('chromereload/devonly');
}

const MENU_APPLY_ON_GITHUB_ISSUES = 'MENU_APPLY_ON_GITHUB_ISSUES';

/** @type {AwilixContainer} */
const container = awilix.createContainer({
  injectionMode: awilix.InjectionMode.PROXY,
});

container.register({
  [DIConstants.LOG]: awilix.asValue(log),
  [DIConstants.UPDATE_BADGE]: awilix.asValue(updateBadge),
  [DIConstants.MESSAGE_ROUTER]: awilix.asClass(MessageRouter).singleton(),
  [DIConstants.R_ACCESS_TOKEN]: awilix.asClass(AccessTokenRepository).singleton(),
  [DIConstants.S_CACHE]: awilix.asClass(CacheService).singleton(),
  [DIConstants.S_CHROME_STORAGE]: awilix.asClass(ChromeStorageService),
  [DIConstants.S_GITHUB]: awilix.asClass(GithubService),
});

/** @type {ChromeStorageService} */
const storageService = container.resolve(DIConstants.S_CHROME_STORAGE);

/** @type {MessageRouter} */
const messageRouter = container.resolve(DIConstants.MESSAGE_ROUTER);

async function applyOnGithubIssuesClickListener() {
  const checked = !await storageService.loadAsync(storageService.KEY_APPLY_ON_GITHUB_ISSUES);
  await storageService.saveAsync(storageService.KEY_APPLY_ON_GITHUB_ISSUES, checked);
  chrome.contextMenus.update(MENU_APPLY_ON_GITHUB_ISSUES, {
    checked,
  });
}

async function initializeExtensionAsync() {
  chrome.runtime.onInstalled.addListener(async (reason, previousVersion) => {
    const isUpdate = reason === 'update' && previousVersion !== version;

    if (process.env.NODE_ENV === 'development') {
      chrome.runtime.openOptionsPage();
    }

    // reset update notification state...
    // 1. in development environment
    // 2. when extension is successfully upgraded
    if (process.env.NODE_ENV === 'development' || isUpdate) {
      return storageService.saveAsync(storageService.KEY_UPDATE_NOTIFICATION_SENT, false);
    }

    return true;
  });

  const checked = !!await storageService.loadAsync(storageService.KEY_APPLY_ON_GITHUB_ISSUES);
  chrome.contextMenus.create({
    id: MENU_APPLY_ON_GITHUB_ISSUES,
    type: 'checkbox',
    title: chrome.i18n.getMessage('applyOnGithubIssues'),
    contexts: ['browser_action'],
    onclick: applyOnGithubIssuesClickListener,
    checked,
  });
}

function main() {
  initializeExtensionAsync();
  messageRouter.start();
}

main();
