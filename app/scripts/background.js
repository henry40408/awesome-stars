import CustomError from 'custom-error';
import { Router } from 'chomex';
import ChromePromise from 'chrome-promise';
import GitHub from 'github-api';
import get from 'lodash/get';
import LRU from 'lru-cache';
import numeral from 'numeral';

import { ERROR, log } from './common';

if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line global-require,import/no-extraneous-dependencies
  require('chromereload/devonly');
}

const AWESOME_LIST_URL = 'https://raw.githubusercontent.com/sindresorhus/awesome/master/readme.md';
const CHANGELOG_URL = 'https://github.com/henry40408/awesome-stars/blob/master/CHANGELOG.md';

const BADGE_COLORS = {
  BRIGHT_BLUE: '#4a94fa',
  RED: '#ff0000',
};

const CACHE_KEYS = {
  AWESOME_LIST: '@@awesome-list',
  GITHUB: '@@github',
};

const LRU_OPTIONS = {
  max: 5000,
  maxAge: 24 * 60 * 60 * 1000, // TTL = 24 hours
};

const NA = '@@NA';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'ACCESS_TOKEN',
};

const RateLimitError = CustomError('RateLimitError');

const lruCache = LRU(LRU_OPTIONS);

const chromePromise = new ChromePromise();

async function loadAccessTokenAsync() {
  const result = await chromePromise.storage.local.get(STORAGE_KEYS.ACCESS_TOKEN);
  const accessToken = get(result, STORAGE_KEYS.ACCESS_TOKEN, '');

  log('storage responds with access token', accessToken);

  return accessToken;
}

function updateBadge(maybeText) {
  const color = maybeText === NA ? BADGE_COLORS.RED : BADGE_COLORS.BRIGHT_BLUE;
  const text = maybeText === NA ? 'N/A' : maybeText;

  log('badge color updated to', color);
  log('badge text updated to', text);

  chrome.browserAction.setBadgeBackgroundColor({ color });
  chrome.browserAction.setBadgeText({ text });
}

async function genGitHub() {
  const cachedGithubAdapter = lruCache.get(CACHE_KEYS.GITHUB);

  if (!cachedGithubAdapter) {
    const accessToken = await loadAccessTokenAsync();
    const githubAdapter = new GitHub({ token: accessToken });

    log('new GitHub adapter generated with access token', accessToken);

    lruCache.set(CACHE_KEYS.GITHUB, githubAdapter);
    return githubAdapter;
  }

  return cachedGithubAdapter;
}

async function fetchAwesomeListAsync() {
  const cachedAwesomeList = lruCache.get(CACHE_KEYS.AWESOME_LIST);

  if (!cachedAwesomeList) {
    const response = await fetch(AWESOME_LIST_URL);
    const body = await response.text();

    log('fetch awesome list', body.length / 1024, 'KB');

    lruCache.set(CACHE_KEYS.AWESOME_LIST, body);
    return body;
  }

  return cachedAwesomeList;
}

async function fetchRateLimitAsync() {
  const github = await genGitHub();
  const rateLimitWrapper = github.getRateLimit();

  try {
    const response = await rateLimitWrapper.getRateLimit();
    const remaining = get(response, 'data.resources.core.remaining', null);
    const limit = get(response, 'data.resources.core.limit', null);

    if (!remaining || !limit) {
      throw new RateLimitError();
    }

    log('github responds with rate limit', remaining, limit);

    const format = remaining < 1000 ? '0a' : '0.0a';
    updateBadge(numeral(remaining).format(format));

    return { limit, remaining };
  } catch (e) {
    updateBadge(NA);
    return ERROR;
  }
}

async function fetchStarCountAsync(owner, name, options = { shouldUpdateRateLimit: true }) {
  const { shouldUpdateRateLimit } = options;
  const cacheKey = JSON.stringify({ name, owner });
  const cachedDetails = lruCache.get(cacheKey);

  if (!cachedDetails) {
    try {
      const github = await genGitHub();
      const repoWrapper = github.getRepo(owner, name);
      const { data: json } = await repoWrapper.getDetails();

      lruCache.set(cacheKey, json);

      log('github responds a JSON object', json);

      if (shouldUpdateRateLimit) {
        fetchRateLimitAsync();
      }

      return parseInt(json.stargazers_count, 10);
    } catch (e) {
      return ERROR;
    }
  }

  log('getStarCountAsync responds with cached detail', cachedDetails);
  return parseInt(cachedDetails.stargazers_count, 10);
}

async function setAccessTokenAsync(accessToken) {
  const payload = {
    [STORAGE_KEYS.ACCESS_TOKEN]: accessToken,
  };

  chromePromise.storage.local.set(payload);

  // NOTE Force GitHub adapter to be re-generated
  lruCache.del(CACHE_KEYS.GITHUB);

  fetchRateLimitAsync();

  // NOTE fire and forget route returns nothing
  return true;
}

chrome.runtime.onInstalled.addListener(() => {
  log(`open changelog ${CHANGELOG_URL}`);
  if (process.env.NODE_ENV !== 'development') {
    return window.open(CHANGELOG_URL);
  }
  return true;
});

chrome.browserAction.onClicked.addListener(() => {
  if (chrome.runtime.openOptionsPage) {
    // New way to open options pages, if supported (Chrome 42+).
    return chrome.runtime.openOptionsPage();
  }
  // Reasonable fallback.
  return window.open(chrome.runtime.getURL('options.html'));
});

fetchRateLimitAsync();

function logMiddleware(route, fn) {
  return (message) => {
    log(route, 'called with', message);
    return fn(message);
  };
}

function registerRoute(router, route, fn) {
  return router.on(route, logMiddleware(route, fn));
}

const messageRouter = new Router();

registerRoute(messageRouter, '/access-token/get', () => loadAccessTokenAsync());

registerRoute(messageRouter, '/access-token/set', (message) => {
  const { accessToken } = message;
  return setAccessTokenAsync(accessToken);
});

registerRoute(messageRouter, '/awesome-list/get', () => fetchAwesomeListAsync());

registerRoute(messageRouter, '/rate-limit', () => fetchRateLimitAsync());

registerRoute(messageRouter, '/stars/get', (message) => {
  const { owner, name, shouldUpdateRateLimit } = message;

  if (owner && name) {
    return fetchStarCountAsync(owner, name, { shouldUpdateRateLimit });
  }

  return ERROR;
});

chrome.runtime.onMessage.addListener(messageRouter.listener());
