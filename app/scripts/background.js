// Enable chromereload by uncommenting this line:
// eslint-disable-next-line
import 'chromereload/devonly';

import Bluebird from 'bluebird';
import ChromePromise from 'chrome-promise';
import lodash from 'lodash';
import ParseGithubUrl from 'parse-github-url';
import LRU from 'lru-cache';

import {
  GET_OPTIONS,
  GET_STARS,
  RATE_LIMIT,
  SET_OPTIONS,
  STORAGE_KEY,
  TEST_TOKEN,
  TOKEN,
} from './constants';

// INITIAL

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

function handleRateLimitAsync() {
  return handleGetOptionsAsync()
    .then((options) => {
      const { accessToken } = options;

      const url = new URL('https://api.github.com/rate_limit');
      if (accessToken) {
        url.searchParams.append('access_token', accessToken);
      }

      return fetch(url)
        .then((resp) => {
          if (!resp.ok) {
            throw new Error('Request failed');
          }
          return resp;
        })
        .then(resp => resp.json())
        .then(json => Bluebird.resolve({
          limit: json.resources.core.limit,
          remaining: json.resources.core.remaining,
        }))
        .catch(() => Bluebird.resolve({ limit: -1, remaining: -1 }));
    });
}

function handleTestTokenAsync() {
  return handleRateLimitAsync()
    .then((rateLimit) => {
      if (rateLimit.limit === -1) {
        throw new Error(TOKEN.INVALID);
      }
      return Bluebird.resolve(TOKEN.VALID);
    })
    .catch(() => Bluebird.resolve(TOKEN.INVALID));
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

    return Bluebird.resolve(lodash.sample([100, 1000, 7500, 10000]));

    // return handleGetOptionsAsync()
    //   .then((options) => {
    //     const { accessToken } = options;

    //     const url = new URL(`https://api.github.com/repos/${repo}`);
    //     url.searchParams.append('access_token', accessToken);

    //     return fetch(url);
    //   })
    //   .then((resp) => {
    //     if (!resp.ok) {
    //       throw new Error('Request failed');
    //     }
    //     return resp;
    //   })
    //   .then(resp => resp.json())
    //   .then((json) => {
    //     const { stargazers_count } = json;
    //     cache.set(rawUrl, { stars: stargazers_count });
    //     return Bluebird.resolve(stargazers_count);
    //   });
  }

  return Bluebird.resolve(null);
}

function main() {
  updateBadgeAsync();

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
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
