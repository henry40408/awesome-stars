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

function initializeExtension() {
  /** @type {ChromeStorageService} */
  const storageService = container.resolve(DIConstants.S_CHROME_STORAGE);

  chrome.contextMenus.create({
    title: 'Apply on GitHub issues',
    contexts: ['browser_action'],
    onclick: () => {},
  });

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
}

function main() {
  initializeExtension();

  /** @type {MessageRouter} */
  const messageRouter = container.resolve(DIConstants.MESSAGE_ROUTER);

  messageRouter.start();
}

main();
