// Enable chromereload by uncommenting this line:
import 'chromereload/devonly';

import ChromePromise from 'chrome-promise';
import lodash from 'lodash';

import {
    GET_OPTIONS,
    RATE_LIMIT,
    SET_OPTIONS,
    STORAGE_KEY,
    TEST_TOKEN,
    TOKEN
} from './constants.js';

// INITIAL

const chromep = new ChromePromise();

// EVENT HANDLERS

updateBadge();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
        case GET_OPTIONS:
            handleGetOptionsAsync(sendResponse);
            break;
        case RATE_LIMIT:
            handleRateLimitAsync(sendResponse);
            break;
        case SET_OPTIONS:
            handleSetOptionsAsync(request, sendResponse);
            break;
        case TEST_TOKEN:
            handleTestTokenAsync(sendResponse);
            break;
        default:
            sendResponse({});
            break;
    }

    return true;
});

// LOCAL FUNCTIONS

function handleGetOptionsAsync(callback) {
    const chromeStorage = chromep.storage.local;

    return chromeStorage.get(STORAGE_KEY).then(value => {
        console.log(value);

        const options = lodash.get(value, STORAGE_KEY, {});
        const accessToken = lodash.get(options, 'access_token', '');
        const fancyStars = lodash.get(options, 'fancy_stars', true);

        return callback({
            accessToken,
            fancyStars
        });
    });
}

function handleRateLimitAsync(callback) {
    return handleGetOptionsAsync(response => {
        const {
            accessToken
        } = response;

        const url = new URL(`https://api.github.com/rate_limit`);

        if (accessToken) {
            url.searchParams.append('access_token', accessToken);
        }

        return fetch(url)
            .then(resp => {
                if (!resp.ok) {
                    throw new Error('Request failed');
                }
                return resp;
            })
            .then(resp => resp.json())
            .then(json => callback({
                limit: json.rate.limit,
                remaining: json.rate.remaining
            }))
            .catch(() => callback({
                limit: -1,
                remaining: -1
            }));
    });
}

function handleSetOptionsAsync(request, callback) {
    const chromeStorage = chromep.storage.local;

    const options = {
        'access_token': request.accessToken,
        'fancy_stars': request.fancyStars
    };

    return chromeStorage.set({
        [STORAGE_KEY]: options
    }).then(() => {
        updateBadge();
        return handleGetOptionsAsync(callback);
    });
}

function handleTestTokenAsync(callback) {
    return handleGetOptionsAsync(response => {
        const accessToken = response.accessToken;

        if (accessToken === '') {
            return callback(TOKEN.EMPTY);
        }

        const url = new URL(`https://api.github.com/rate_limit`);
        url.searchParams.append('access_token', accessToken);

        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(TOKEN.INVALID);
                }
                return callback(TOKEN.VALID);
            })
            .catch(() => callback(TOKEN.INVALID));
    });
}

function updateBadge(){
    return handleTestTokenAsync(response => {
        const browserAction = chrome.browserAction;

        browserAction.setBadgeText({
            text: response === TOKEN.VALID ? '\u2714' : '\u2715'
        });

        browserAction.setBadgeBackgroundColor({
            color: response === TOKEN.VALID ? 'green' : 'red'
        });
    });
}
