import * as awilix from 'awilix';

import { log, updateBadge } from './common';
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

container.register({
  [DIConstants.LOG]: awilix.asValue(log),
  [DIConstants.UPDATE_BADGE]: awilix.asValue(updateBadge),
  [DIConstants.MESSAGE_ROUTER]: awilix.asClass(MessageRouter).singleton(),
  [DIConstants.R_ACCESS_TOKEN]: awilix.asClass(AccessTokenRepository).singleton(),
  [DIConstants.S_CACHE]: awilix.asClass(CacheService).singleton(),
  [DIConstants.S_CHROME_STORAGE]: awilix.asClass(ChromeStorageService),
  [DIConstants.S_GITHUB]: awilix.asClass(GithubService),
});

container.resolve(DIConstants.MESSAGE_ROUTER).start();
