// Enable chromereload by uncommenting this line:
import 'chromereload/devonly';

import {
    RATE_LIMIT
} from './constants.js';

chrome.runtime.onInstalled.addListener(function(details) {
    console.log('previousVersion', details.previousVersion);
});

chrome.browserAction.setBadgeText({
    text: '!'
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
        case RATE_LIMIT:
            fetch(`https://api.github.com/rate_limit`)
                .then(resp => resp.json())
                .then(json => sendResponse({
                    limit: json.rate.limit,
                    remaining: json.rate.remaining
                }));
            break;
        default:
            sendResponse({});
            break;
    }

    return true;
});

console.log('Awesome Stars is ready');
