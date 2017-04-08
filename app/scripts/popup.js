import 'normalize-css/normalize.css';

import ChromePromise from 'chrome-promise';

import {
    GET_OPTIONS,
    RATE_LIMIT
} from './constants';

const chromep = new ChromePromise();
const doc = document;

doc.addEventListener("DOMContentLoaded", main);

function main() {
    const $tokenUsed = doc.getElementById('token-used');
    const $rateLimitRemaining = doc.getElementById('rate-limit-remaining');
    const $rateLimitLimit = doc.getElementById('rate-limit-limit');

    chromep.runtime.sendMessage({
        type: RATE_LIMIT
    }).then(response => {
        $rateLimitLimit.innerHTML = response.limit;
        $rateLimitRemaining.innerHTML = response.remaining;

        return chromep.runtime.sendMessage({
            type: GET_OPTIONS
        });
    }).then(response => {
        const {
            accessToken
        } = response;

        if (accessToken) {
            $tokenUsed.style.color = 'green';
            $tokenUsed.innerHTML = 'Yes';
        } else {
            $tokenUsed.style.color = 'red';
            $tokenUsed.innerHTML = 'No';
        }
    });

    return true;
}
