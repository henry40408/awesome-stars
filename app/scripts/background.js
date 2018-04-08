import * as awilix from 'awilix';
import format from 'date-fns/format';

import colors from './themes/colors';
import DIConstants from './constants';

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

function log(...args) {
  if (process.env.NODE_ENV === 'development') {
    const now = format(new Date(), 'YYYY-MM-DDTHH:mm:ssZ');
    // eslint-disable-next-line no-console
    console.log(`[${now}]`, ...args);
  }
}

function updateBadge(maybeText) {
  const color = maybeText === null ? colors.red : colors.blue;
  const text = maybeText === null ? 'N/A' : maybeText;

  log('badge updated:', { color, text });

  chrome.browserAction.setBadgeBackgroundColor({ color });
  chrome.browserAction.setBadgeText({ text });
}

container.register({
  [DIConstants.LOG]: awilix.asValue(log),
  [DIConstants.MESSAGE_ROUTER]: awilix.asClass(MessageRouter).singleton(),
  [DIConstants.UPDATE_BADGE]: awilix.asValue(updateBadge),
  [DIConstants.R_ACCESS_TOKEN]: awilix.asClass(AccessTokenRepository),
  [DIConstants.S_CACHE]: awilix.asClass(CacheService).singleton(),
  [DIConstants.S_CHROME_STORAGE]: awilix.asClass(ChromeStorageService),
  [DIConstants.S_GITHUB]: awilix.asClass(GithubService),
});

container.resolve(DIConstants.MESSAGE_ROUTER).start();
