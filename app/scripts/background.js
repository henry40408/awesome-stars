// Enable chromereload by uncommenting this line:
// eslint-disable-next-line
import 'chromereload/devonly';

import Bluebird from 'bluebird';
import ChromePromise from 'chrome-promise';
import lodash from 'lodash';
import ParseGithubUrl from 'parse-github-url';
import LRU from 'lru-cache';

import {
  GET_CACHE_ITEMCOUNT,
  GET_OPTIONS,
  GET_STARS,
  RATE_LIMIT,
  SET_OPTIONS,
  STORAGE_KEY,
  TEST_TOKEN,
  TOKEN,
} from './constants';

// INITIAL

const LRU_RATELIMIT = 'RATE_LIMIT';
const LRU_RATELIMIT_MAXAGE = 1000 * 60 * 5;

const LRU_OPTIONS = {
  max: 5000,
  maxAge: 1000 * 60 * 60 * 24,
};

const chromep = new ChromePromise();
const cache = new LRU(LRU_OPTIONS);

// LOCAL FUNCTIONS

function handleGetOptionsAsync() {
  const chromeStorage = chromep.storage.local;

  return chromeStorage.get(STORAGE_KEY)
    .then((value) => {
      const options = lodash.get(value, STORAGE_KEY, {});
      const accessToken = lodash.get(options, 'access_token', '');
      const fancyStars = lodash.get(options, 'fancy_stars', true);

      return Bluebird.resolve({
        accessToken,
        fancyStars,
      });
    });
}

function updateRateLimit(remaining, limit) {
  const rateLimit = { remaining, limit };
  cache.set(LRU_RATELIMIT, rateLimit, LRU_RATELIMIT_MAXAGE);
  return rateLimit;
}

function getRateLimit() {
  return cache.get(LRU_RATELIMIT);
}

function handleRateLimitAsync() {
  return handleGetOptionsAsync()
    .then((options) => {
      const { accessToken } = options;

      const url = new URL('https://api.github.com/rate_limit');
      if (accessToken) {
        url.searchParams.append('access_token', accessToken);
      }

      const cachedRateLimit = getRateLimit();
      if (cachedRateLimit) {
        return Bluebird.resolve(cachedRateLimit);
      }

      console.log(`fetch ${url}`);
      return fetch(url)
        .then((resp) => {
          if (!resp.ok) {
            throw new Error('Request failed');
          }
          return resp;
        })
        .then(resp => resp.json())
        .then((json) => {
          const { remaining, limit } = json.resources.core;
          const rateLimit = updateRateLimit(remaining, limit);
          return Bluebird.resolve(rateLimit);
        })
        .catch(() => Bluebird.resolve({ limit: -1, remaining: -1 }));
    });
}

function handleTestTokenAsync() {
  return Bluebird.all([
    handleGetOptionsAsync(),
    handleRateLimitAsync(),
  ]).spread((options, rateLimit) => {
    if (options.accessToken === '') {
      return Bluebird.resolve(TOKEN.EMPTY);
    }

    if (rateLimit.limit >= 0) {
      return Bluebird.resolve(TOKEN.VALID);
    }

    return Bluebird.resolve(TOKEN.INVALID);
  });
}

function updateBadgeAsync() {
  return handleTestTokenAsync()
    .then((response) => {
      const browserAction = chrome.browserAction;

      let color;
      let text;

      switch (response) {
        case TOKEN.VALID:
          color = 'green';
          text = '\u2714';
          break;
        case TOKEN.INVALID:
          color = 'red';
          text = '\u2715';
          break;
        default:
          color = 'black';
          text = '?';
          break;
      }

      browserAction.setBadgeText({ text });
      browserAction.setBadgeBackgroundColor({ color });
    });
}

function handleSetOptionsAsync(request) {
  const chromeStorage = chromep.storage.local;

  const options = {
    access_token: request.accessToken,
    fancy_stars: request.fancyStars,
  };

  return chromeStorage.set({
    [STORAGE_KEY]: options,
  }).then(() => {
    updateBadgeAsync();
    return handleGetOptionsAsync();
  });
}

function handleGetStarsAsync(request) {
  const { url: rawUrl } = request;
  const { repo } = ParseGithubUrl(rawUrl);

  if (repo !== null) {
    const item = cache.get(rawUrl);

    if (item) {
      const { stars } = item;
      return Bluebird.resolve(stars);
    }

    return handleGetOptionsAsync()
      .then((options) => {
        const { accessToken } = options;

        const url = new URL(`https://api.github.com/repos/${repo}`);
        url.searchParams.append('access_token', accessToken);

        console.log(`fetch ${url}`);
        return fetch(url);
      })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error('Request failed');
        }

        const remaining = resp.headers.get('X-RateLimit-Remaining');
        const limit = resp.headers.get('X-RateLimit-Limit');
        updateRateLimit(remaining, limit);

        return resp;
      })
      .then(resp => resp.json())
      .then((json) => {
        const { stargazers_count } = json;
        cache.set(rawUrl, { stars: stargazers_count });
        return Bluebird.resolve(stargazers_count);
      })
      .catch(lodash.noop);
  }

  return Bluebird.resolve(null);
}

function getCacheItemCountAsync() {
  // NOTE exclude cached rate limit
  return Bluebird.resolve(cache.itemCount - 1 > 0 ? cache.itemCount : 0);
}

function main() {
  updateBadgeAsync();

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
      case GET_CACHE_ITEMCOUNT:
        getCacheItemCountAsync().then(sendResponse);
        break;
      case GET_OPTIONS:
        handleGetOptionsAsync().then(sendResponse);
        break;
      case RATE_LIMIT:
        handleRateLimitAsync().then(sendResponse);
        break;
      case SET_OPTIONS:
        handleSetOptionsAsync(request).then(sendResponse);
        break;
      case TEST_TOKEN:
        handleTestTokenAsync().then(sendResponse);
        break;
      case GET_STARS:
        handleGetStarsAsync(request).then(sendResponse);
        break;
      default:
        sendResponse({});
        break;
    }

    return true;
  });
}

// ENTRYPOINT

main();
