// Enable chromereload by uncommenting this line:
// eslint-disable-next-line import/no-extraneous-dependencies
import 'chromereload/devonly';

import lodash from 'lodash';
import { Router } from 'chomex';
import ChromePromise from 'chrome-promise';
import GitHub from 'github-api';

const chromep = new ChromePromise();
const storage = chromep.storage.local;

let gh = new GitHub();

const Key = {
  ACCESS_TOKEN: 'ACCESS_TOKEN',
};

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
    log('/access-token/get called with response: ', accessToken);
    return accessToken;
  });
}

// Event Listener //

chrome.browserAction.onClicked.addListener(() => {
  if (chrome.runtime.openOptionsPage) { // New way to open options pages, if supported (Chrome 42+).
    return chrome.runtime.openOptionsPage();
  }
  return window.open(chrome.runtime.getURL('options.html')); // Reasonable fallback.
});

// Message Router //

const router = new Router();

router.on('/access-token/get', () => loadAccessTokenAsync());

router.on('/access-token/set', (message) => {
  const { accessToken } = message;
  log('/access-token/set called with request:', accessToken);
  const payload = lodash.set({}, Key.ACCESS_TOKEN, accessToken);
  return storage.set(payload).then(() => true);
});

router.on('/rate-limit', () => loadAccessTokenAsync().then((accessToken) => {
  if (!lodash.isEmpty(accessToken)) {
    gh = new GitHub({ token: accessToken });
  }

  const rateLimit = gh.getRateLimit();
  return rateLimit.getRateLimit().then((response) => {
    const remaining = lodash.get(response, 'data.resources.core.remaining', 0);
    const limit = lodash.get(response, 'data.resources.core.limit', 0);
    log('/rate-limit called with response:', remaining, limit);
    return { limit, remaining };
  });
}));

chrome.runtime.onMessage.addListener(router.listener());
