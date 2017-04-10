// Enable chromereload by uncommenting this line:
// eslint-disable-next-line
import 'chromereload/devonly';

import Bluebird from 'bluebird';
import ChromePromise from 'chrome-promise';
import lodash from 'lodash';

import {
  GET_OPTIONS,
  RATE_LIMIT,
  SET_OPTIONS,
  STORAGE_KEY,
  TEST_TOKEN,
  TOKEN,
} from './constants';

// INITIAL

const chromep = new ChromePromise();

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

function handleTestTokenAsync() {
  return handleGetOptionsAsync()
    .then((options) => {
      const accessToken = options.accessToken;

      if (accessToken === '') {
        return Bluebird.resolve(TOKEN.EMPTY);
      }

      const url = new URL('https://api.github.com/rate_limit');
      url.searchParams.append('access_token', accessToken);

      return fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(TOKEN.INVALID);
          }
          return Bluebird.resolve(TOKEN.VALID);
        })
        .catch(() => Bluebird.resolve(TOKEN.INVALID));
    });
}

function updateBadgeAsync() {
  return handleTestTokenAsync()
    .then((response) => {
      const browserAction = chrome.browserAction;

      browserAction.setBadgeText({
        text: response === TOKEN.VALID ? '\u2714' : '\u2715',
      });

      browserAction.setBadgeBackgroundColor({
        color: response === TOKEN.VALID ? 'green' : 'red',
      });
    });
}

function handleRateLimitAsync() {
  return handleGetOptionsAsync()
    .then((options) => {
      const {
        accessToken,
      } = options;

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
          limit: json.rate.limit,
          remaining: json.rate.remaining,
        }))
        .catch(() => Bluebird.resolve({
          limit: -1,
          remaining: -1,
        }));
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
      default:
        sendResponse({});
        break;
    }

    return true;
  });
}

// ENTRYPOINT

main();
