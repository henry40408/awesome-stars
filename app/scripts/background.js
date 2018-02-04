import octokit from '@octokit/rest';
import { Router } from 'chomex';
import ChromePromise from 'chrome-promise';
import format from 'date-fns/format';
import get from 'lodash/get';
import LRU from 'lru-cache';
import numeral from 'numeral';

import { version } from '../../package.json';
import colors from './themes/colors';
import DIConstants from './constants';

if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line global-require,import/no-extraneous-dependencies
  require('chromereload/devonly');
}

const awilix = require('awilix');

const container = awilix.createContainer({
  injectionMode: awilix.InjectionMode.PROXY,
});

class AccessTokenRepository {
  KEY_ACCESS_TOKEN = 'ACCESS_TOKEN';

  constructor(ctx) {
    /** @type {CommonService} */
    this.common = ctx[DIConstants.S_COMMON];
    /** @type {ChromeStorageService} */
    this.storage = ctx[DIConstants.S_CHROME_STORAGE];
  }

  async loadAsync() {
    return this.storage.loadAsync(this.KEY_ACCESS_TOKEN, '');
  }

  async saveAsync(accessToken) {
    return this.storage.saveAsync(this.KEY_ACCESS_TOKEN, accessToken);
  }
}

class CacheService extends LRU {
  constructor() {
    super({
      max: 5000,
      maxAge: 24 * 60 * 60 * 1000, // TTL = 24 hours
    });
  }
}
class ChromeStorageService {
  KEY_UPDATE_NOTIFICATION_SENT = 'UPDATE_NOTIFICATION_SENT';

  constructor(ctx) {
    /** @type {CommonService} */
    this.common = ctx[DIConstants.S_COMMON];
    this.chromePromise = new ChromePromise();
  }

  async loadAsync(key, defaultValue = null) {
    let value = await this.chromePromise.storage.local.get(key);
    value = get(value, key, defaultValue);
    this.common.log('load', key, 'from Chrome storage:', value);
    return value;
  }

  async saveAsync(key, value) {
    const payload = { [key]: value };
    this.common.log('save', key, 'to Chrome storage:', value);
    return this.chromePromise.storage.local.set(payload);
  }
}

class CommonService {
  log = (...args) => {
    if (process.env.NODE_ENV === 'development') {
      const now = format(new Date(), 'YYYY-MM-DDTHH:mm:ssZ');
      // eslint-disable-next-line no-console
      console.log(`[${now}]`, ...args);
    }
  };

  updateBadge = (maybeText) => {
    const color = maybeText === null ? colors.red : colors.blue;
    const text = maybeText === null ? 'N/A' : maybeText;

    this.log('badge updated:', { color, text });

    chrome.browserAction.setBadgeBackgroundColor({ color });
    chrome.browserAction.setBadgeText({ text });
  };
}

class GithubService {
  AWESOME_LIST_URL = 'https://raw.githubusercontent.com/sindresorhus/awesome/master/readme.md';

  AWESOME_LIST_KEY = '@@awesome-list';
  GITHUB_KEY = '@@github';

  constructor(ctx) {
    /** @type {AccessTokenRepository} */
    this.accessToken = ctx[DIConstants.R_ACCESS_TOKEN];
    /** @type {CommonService} */
    this.common = ctx[DIConstants.S_COMMON];
    /** @type {LRU} */
    this.cache = ctx[DIConstants.S_CACHE];
  }

  async buildClient() {
    const token = await this.accessToken.loadAsync();
    let client = this.cache.get(this.GITHUB_KEY);
    if (!client) {
      client = octokit();
      client.authenticate({ type: 'token', token });
      this.cache.set(this.GITHUB_KEY, client);
    }
    return client;
  }

  async fetchAwesomeListAsync() {
    let awesomeList = this.cache.get(this.AWESOME_LIST_KEY);

    if (!awesomeList) {
      const response = await fetch(this.AWESOME_LIST_URL);
      awesomeList = await response.text();
      this.common.log(
        'fetch awesome list',
        (awesomeList.length / 1024).toFixed(3),
        'KB(s) from github',
      );
      this.cache.set(this.AWESOME_LIST_KEY, awesomeList);
    } else {
      this.common.log(
        'fetch awesome list',
        (awesomeList.length / 1024).toFixed(3),
        'KB(s) from cache',
      );
    }

    return awesomeList;
  }

  async fetchRateLimitAsync() {
    const client = await this.buildClient();
    try {
      const rateLimit = await client.misc.getRateLimit({});
      const { data: { rate: { remaining, limit } } } = rateLimit;

      this.common.log('rate limit:', { remaining, limit });

      const textFormat = remaining < 1000 ? '0a' : '0.0a';
      const badgeText = numeral(remaining).format(textFormat);
      this.common.updateBadge(badgeText);

      return { remaining, limit };
    } catch (e) {
      this.common.updateBadge(null);
      return { remaining: -1, limit: -1 };
    }
  }

  async fetchStarCountAsync(owner, name, options = { shouldUpdateRateLimit: true }) {
    const client = await this.buildClient();
    const cacheKey = `/repos/${owner}/${name}`;
    let repo = this.cache.get(cacheKey);

    if (!repo) {
      try {
        repo = await client.repos.get({ owner, repo: name });
        this.common.log('fetch repository from github', repo);
        this.cache.set(cacheKey, repo);

        const { shouldUpdateRateLimit } = options;
        if (shouldUpdateRateLimit) {
          this.fetchRateLimitAsync();
        }
      } catch (e) {
        this.common.updateBadge(null);
        return -1;
      }
    } else {
      this.common.log('fetch repository from cache', repo);
    }

    const { data: { stargazers_count } } = repo;
    return parseInt(stargazers_count, 10);
  }
}

class MessageRouter {
  constructor(ctx) {
    /** @type {AccessTokenRepository} */
    this.accessToken = ctx[DIConstants.R_ACCESS_TOKEN];
    /** @type {CommonService} */
    this.common = ctx[DIConstants.S_COMMON];
    /** @type {GithubService} */
    this.github = ctx[DIConstants.S_GITHUB];
    /** @type {ChromeStorageService} */
    this.storage = ctx[DIConstants.S_CHROME_STORAGE];

    this.messageRouter = new Router();

    chrome.runtime.onInstalled.addListener(async (reason, previousVersion) => {
      const isUpdate = reason === 'update' && previousVersion !== version;

      if (process.env.NODE_ENV === 'development') {
        chrome.runtime.openOptionsPage();
      }

      // reset update notification state...
      // 1. in development environment
      // 2. when extension is successfully upgraded
      if (process.env.NODE_ENV === 'development' || isUpdate) {
        return this.storage.saveAsync(this.storage.KEY_UPDATE_NOTIFICATION_SENT, false);
      }

      return true;
    });

    chrome.browserAction.onClicked.addListener(() => {
      const { runtime } = chrome;

      if (runtime.openOptionsPage) {
        // New way to open options pages, if supported (Chrome 42+).
        return runtime.openOptionsPage();
      }

      // Reasonable fallback.
      return window.open(runtime.getURL('pages/options.html'));
    });

    this.registerAll();

    this.github.fetchRateLimitAsync();
  }

  register(route, fn) {
    return this.messageRouter.on(route, async (message) => {
      this.common.log(route, 'called with', message);
      return fn(message);
    });
  }

  registerAll() {
    this.register('/access-token/get', async () => this.accessToken.loadAsync());

    this.register('/access-token/set', async (message) => {
      const { accessToken: token } = message;
      await this.accessToken.saveAsync(token);
      return this.github.fetchRateLimitAsync();
    });

    this.register('/awesome-list/get', async () => this.github.fetchAwesomeListAsync());

    this.register('/rate-limit', async () => this.github.fetchRateLimitAsync());

    this.register('/stars/get', async (message) => {
      const { owner, name, shouldUpdateRateLimit } = message;

      if (owner && name) {
        return this.github.fetchStarCountAsync(owner, name, { shouldUpdateRateLimit });
      }

      return -1;
    });

    this.register('/update-notification-sent/get', async () =>
      this.storage.loadAsync(this.storage.KEY_UPDATE_NOTIFICATION_SENT),
    );

    this.register('/update-notification-sent/set', async (message) => {
      const { updateNotificationSent } = message;
      return this.storage.saveAsync(
        this.storage.KEY_UPDATE_NOTIFICATION_SENT,
        updateNotificationSent,
      );
    });
  }

  start() {
    chrome.runtime.onMessage.addListener(this.messageRouter.listener());
  }
}

container.register({
  [DIConstants.MESSAGE_ROUTER]: awilix.asClass(MessageRouter),
  [DIConstants.R_ACCESS_TOKEN]: awilix.asClass(AccessTokenRepository),
  [DIConstants.S_CACHE]: awilix.asClass(CacheService).singleton(),
  [DIConstants.S_CHROME_STORAGE]: awilix.asClass(ChromeStorageService),
  [DIConstants.S_COMMON]: awilix.asClass(CommonService),
  [DIConstants.S_GITHUB]: awilix.asClass(GithubService),
});

container.resolve(DIConstants.MESSAGE_ROUTER).start();
