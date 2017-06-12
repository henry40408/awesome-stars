import Bluebird from 'bluebird';
import lodash from 'lodash';
import ChromePromise from 'chrome-promise';
import { Router } from 'chomex';
import GitHub from 'github-api';
import LRU from 'lru-cache';
import moment from 'moment';
import numeral from 'numeral';

const DEVELOPMENT = 'development';
const LRU_OPTIONS = { max: 5000, maxAge: 24 * 60 * 60 * 1000 };

if (process.env.NODE_ENV === DEVELOPMENT) {
  // eslint-disable-next-line global-require,import/no-extraneous-dependencies
  require('chromereload/devonly');
}

const Keys = { ACCESS_TOKEN: 'ACCESS_TOKEN' };
const cache = LRU(LRU_OPTIONS);
const chromep = new ChromePromise();
const storage = chromep.storage.local;

// Local Functions //

function log(...args) {
  if (process.env.NODE_ENV === DEVELOPMENT) {
    const argsWithMoment = [`[${moment().format()}]`, ...args];
    // eslint-disable-next-line no-console
    console.log.apply(null, argsWithMoment);
  }
}

function loadAccessTokenAsync() {
  return storage.get(Keys.ACCESS_TOKEN).then((result) => {
    const accessToken = lodash.get(result, Keys.ACCESS_TOKEN, '');
    log('storage responds with access token', accessToken);
    return accessToken;
  });
}

function updateBadge(str) {
  log('badge text updated', str);
  chrome.browserAction.setBadgeText({ text: str });
}

function fetchRateLimitAsync() {
  return loadAccessTokenAsync().then((accessToken) => {
    let gh = new GitHub();

    if (!lodash.isEmpty(accessToken)) {
      gh = new GitHub({ token: accessToken });
    }

    const rateLimit = gh.getRateLimit();
    return rateLimit.getRateLimit()
      .then((response) => {
        let format;

        const remaining = lodash.get(response, 'data.resources.core.remaining', 0);
        const limit = lodash.get(response, 'data.resources.core.limit', 0);

        log('github responds with rate limit', remaining, limit);

        if (remaining < 1000) {
          format = '0a';
        } else {
          format = '0.0a';
        }

        updateBadge(numeral(remaining).format(format));

        return { limit, remaining };
      })
      .catch(() => ({ limit: 0, remaining: 0 }));
  });
}

function getStarCountAsync(owner, name, options = {}) {
  const { accessToken } = options;
  const cacheKey = JSON.stringify({ name, owner });
  const cachedDetails = cache.get(cacheKey);

  let gh;

  if (accessToken) {
    gh = new GitHub({ token: accessToken });
  } else {
    gh = new GitHub();
  }

  if (!cachedDetails) {
    const repo = gh.getRepo(owner, name);

    let starCount;
    return repo.getDetails()
      .then(response => response.data)
      .then((json) => {
        cache.set(cacheKey, json);
        log('github responds a JSON object', json);
        starCount = parseInt(json.stargazers_count, 10);
        return fetchRateLimitAsync();
      })
      .then(() => starCount)
      .catch(() => -1);
  }

  log('getStarCountAsync responds with cached detail', cachedDetails);
  return Bluebird.resolve(parseInt(cachedDetails.stargazers_count, 10));
}

function setAccessTokenAsync(accessToken) {
  const payload = lodash.set({}, Keys.ACCESS_TOKEN, accessToken);
  return storage.set(payload).then(() => true);
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

// Message Router //

const router = new Router();

router.on('/access-token/get', () => loadAccessTokenAsync());

router.on('/access-token/set', (message) => {
  const { accessToken } = message;
  log('/access-token/set called with request', accessToken);
  return setAccessTokenAsync(accessToken);
});

router.on('/rate-limit', () => fetchRateLimitAsync());

router.on('/stars/get', message => loadAccessTokenAsync().then((accessToken) => {
  log('/stars/get called with request', message);

  const { owner, name } = message;

  if (lodash.isEmpty(owner) || lodash.isEmpty(name)) {
    return Bluebird.resolve(0);
  }

  return getStarCountAsync(owner, name, { accessToken });
}));

chrome.runtime.onMessage.addListener(router.listener());
