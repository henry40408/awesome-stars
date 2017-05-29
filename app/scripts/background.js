import lodash from 'lodash';
import { Router } from 'chomex';
import ChromePromise from 'chrome-promise';
import GitHub from 'github-api';
import LRU from 'lru-cache';
import numeral from 'numeral';

// Enable chromereload by uncommenting this line:
if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line global-require,import/no-extraneous-dependencies
  require('chromereload/devonly');
}

const Key = { ACCESS_TOKEN: 'ACCESS_TOKEN' };
const LRU_OPTIONS = { max: 5000, maxAge: 24 * 60 * 60 * 1000 };

const cache = LRU(LRU_OPTIONS);
const chromep = new ChromePromise();
const storage = chromep.storage.local;

// Local Functions //

function log(...args) {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log.apply(null, args);
  }
}

function loadAccessTokenAsync() {
  return storage.get(Key.ACCESS_TOKEN).then((result) => {
    const accessToken = lodash.get(result, Key.ACCESS_TOKEN, '');
    log('Chrome Extension storage responds with access token:', accessToken);
    return accessToken;
  });
}

function updateBadge(str) {
  log('badge text updated:', str);
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
        const remaining = lodash.get(response, 'data.resources.core.remaining', 0);
        const limit = lodash.get(response, 'data.resources.core.limit', 0);

        log('GitHub API responds with rate limit:', remaining, limit);

        let format = '0.0a';
        if (remaining < 1000) {
          format = '0a';
        }
        updateBadge(numeral(remaining).format(format));

        return { limit, remaining };
      })
      .catch(() => ({ limit: 0, remaining: 0 }));
  });
}

// Event Listeners //

chrome.browserAction.onClicked.addListener(() => {
  if (chrome.runtime.openOptionsPage) { // New way to open options pages, if supported (Chrome 42+).
    return chrome.runtime.openOptionsPage();
  }
  return window.open(chrome.runtime.getURL('options.html')); // Reasonable fallback.
});

fetchRateLimitAsync();

// Message Router //

const router = new Router();

router.on('/access-token/get', () => loadAccessTokenAsync());

router.on('/access-token/set', (message) => {
  const { accessToken } = message;
  log('/access-token/set called with request:', accessToken);
  const payload = lodash.set({}, Key.ACCESS_TOKEN, accessToken);
  return storage.set(payload).then(() => true);
});

router.on('/rate-limit', fetchRateLimitAsync);

router.on('/stars/get', message => loadAccessTokenAsync().then((accessToken) => {
  let gh = new GitHub();

  if (accessToken) {
    gh = new GitHub({ token: accessToken });
  }

  const { owner, name } = message;

  log('/stars/get called with request:', message);

  if (!lodash.isString(owner) || lodash.isEmpty(owner) ||
    !lodash.isString(name) || lodash.isEmpty(name)) {
    return 0;
  }

  const cacheKey = JSON.stringify({ name, owner });
  const cachedDetails = cache.get(cacheKey);

  if (!cachedDetails) {
    const repo = gh.getRepo(owner, name);

    let starCount;
    return repo.getDetails()
      .then(response => response.data)
      .then((json) => {
        cache.set(cacheKey, json);
        log('GitHub API responds a JSON object:', json);
        starCount = parseInt(json.stargazers_count, 10);

        return fetchRateLimitAsync();
      })
      .then(() => starCount)
      .catch(() => -1);
  }

  log('/stars/get responds with cached detail', cachedDetails);
  return parseInt(cachedDetails.stargazers_count, 10);
}));

chrome.runtime.onMessage.addListener(router.listener());
