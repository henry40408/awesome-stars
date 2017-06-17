import Bluebird from 'bluebird';
import lodash from 'lodash';
import { Router } from 'chomex';
import GitHub from 'github-api';
import LRU from 'lru-cache';
import moment from 'moment';
import numeral from 'numeral';

Bluebird.promisifyAll(chrome.storage.local);

if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line global-require,import/no-extraneous-dependencies
  require('chromereload/devonly');
}

// Constants //

const COLORS = {
  BRIGHT_BLUE: '#4a94fa',
  RED: '#ff0000',
};

const KEYS = {
  ACCESS_TOKEN: 'ACCESS_TOKEN',
};

const LRU_OPTIONS = {
  max: 5000,
  maxAge: 24 * 60 * 60 * 1000, // TTL = 24 hours
};

const NA = Symbol('@@NA');

// Cache & Storage //

const cache = LRU(LRU_OPTIONS);

const localStorage = chrome.storage.local;

// Local Functions //

function log(...args) {
  if (process.env.NODE_ENV === 'development') {
    const argsWithMoment = [`[${moment().format()}]`, ...args];
    // eslint-disable-next-line no-console
    console.log.apply(null, argsWithMoment);
  }
}

async function loadAccessTokenAsync() {
  const result = await localStorage.get(KEYS.ACCESS_TOKEN);
  const accessToken = lodash.get(result, KEYS.ACCESS_TOKEN, '');

  log('storage responds with access token', accessToken);

  return accessToken;
}

function updateBadge(strOrSignal) {
  const color = strOrSignal === NA ? COLORS.RED : COLORS.BRIGHT_BLUE;
  const text = strOrSignal === NA ? 'N/A' : strOrSignal;

  log('badge text updated to', text);

  chrome.browserAction.setBadgeBackgroundColor({ color });
  chrome.browserAction.setBadgeText({ text });
}

async function fetchRateLimitAsync() {
  const accessToken = await loadAccessTokenAsync();
  const github = accessToken ? new GitHub({ token: accessToken }) : new GitHub();
  const rateLimit = github.getRateLimit();

  try {
    const response = await rateLimit.getRateLimit();
    const remaining = lodash.get(response, 'data.resources.core.remaining', 0);
    const limit = lodash.get(response, 'data.resources.core.limit', 0);

    log('github responds with rate limit', remaining, limit);

    const format = remaining < 1000 ? '0a' : '0.0a';
    updateBadge(numeral(remaining).format(format));

    return { limit, remaining };
  } catch (e) {
    updateBadge(NA);
    return { limit: 0, remaining: 0 };
  }
}

async function getStarCountAsync(owner, name, options = {}) {
  const { accessToken } = options;
  const cacheKey = JSON.stringify({ name, owner });
  const cachedDetails = cache.get(cacheKey);

  if (!cachedDetails) {
    try {
      const github = accessToken ? new GitHub({ token: accessToken }) : new GitHub();
      const repoWrapper = github.getRepo(owner, name);
      const { data: json } = await repoWrapper.getDetails();

      cache.set(cacheKey, json);

      log('github responds a JSON object', json);

      fetchRateLimitAsync();

      return parseInt(json.stargazers_count, 10);
    } catch (e) {
      return -1;
    }
  }

  log('getStarCountAsync responds with cached detail', cachedDetails);
  return parseInt(cachedDetails.stargazers_count, 10);
}

async function setAccessTokenAsync(accessToken) {
  const payload = {
    [KEYS.ACCESS_TOKEN]: accessToken,
  };

  localStorage.set(payload);

  fetchRateLimitAsync();

  return true;
}

// Routes //

async function getStarsRouteAsync(message) {
  const accessToken = await loadAccessTokenAsync();
  const { owner, name } = message;

  log('/stars/get called with request', message);

  if (owner && name) {
    return getStarCountAsync(owner, name, { accessToken });
  }

  return -1;
}

async function setAccessTokenRouteAsync(message) {
  const { accessToken } = message;

  log('/access-token/set called with request', accessToken);

  return setAccessTokenAsync(accessToken);
}

// Event Listeners //

chrome.browserAction.onClicked.addListener(() => {
  if (chrome.runtime.openOptionsPage) {
    // New way to open options pages, if supported (Chrome 42+).
    return chrome.runtime.openOptionsPage();
  }
  // Reasonable fallback.
  return window.open(chrome.runtime.getURL('options.html'));
});

fetchRateLimitAsync();

// Chrome Message Server //

const router = new Router();

router.on('/access-token/get', () => loadAccessTokenAsync());

router.on('/access-token/set', message => setAccessTokenRouteAsync(message));

router.on('/rate-limit', () => fetchRateLimitAsync());

router.on('/stars/get', message => getStarsRouteAsync(message));

chrome.runtime.onMessage.addListener(router.listener());
