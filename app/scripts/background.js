// Enable chromereload by uncommenting this line:
import 'chromereload/devonly';

import ChromePromise from 'chrome-promise';
import lodash from 'lodash';

import {
    GET_OPTIONS,
    RATE_LIMIT,
    STORAGE_KEY
} from './constants.js';

// INITIAL

const chromep = new ChromePromise();

// EVENT HANDLERS

handleGetOptions(response => {
    const browserAction = chrome.browserAction;
    const {
        accessToken
    } = response;

    browserAction.setBadgeText({
        text: accessToken ? '\u2714' : '!'
    });
    browserAction.setBadgeBackgroundColor({
        color: accessToken ? 'blue' : 'red'
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
        case RATE_LIMIT:
            handleRateLimit(sendResponse);
            break;
        case GET_OPTIONS:
            handleGetOptions(sendResponse);
            break;
        default:
            sendResponse({});
            break;
    }

    return true;
});

// LOCAL FUNCTIONS

function handleRateLimit(callback) {
    return fetch(`https://api.github.com/rate_limit`)
        .then(resp => resp.json())
        .then(json => callback({
            limit: json.rate.limit,
            remaining: json.rate.remaining
        }));
}

function handleGetOptions(callback) {
    const chromeStorage = chromep.storage.local;

    return chromeStorage.get(STORAGE_KEY).then(value => {
        const options = lodash.get(value, 'options', {});
        const accessToken = lodash.get(options, 'access_token', '');
        const fancyStars = lodash.get(options, 'fancy_stars', true);

        return callback({
            accessToken,
            fancyStars
        });
    });
}
