import ChromePromise from 'chrome-promise';

import {
    GET_OPTIONS
} from './constants';

// INITIAL

const chromep = new ChromePromise();
const doc = document;

// MAIN FUNCTIONS

doc.addEventListener("DOMContentLoaded", main);

function main() {
    const $accessToken = doc.getElementById('access-token');
    const $fancyStars = doc.getElementById('fancy-stars');

    return chromep.runtime.sendMessage({
        type: GET_OPTIONS
    }).then(response => {
        const {
            accessToken,
            fancyStars
        } = response;

        $accessToken.value = accessToken;
        $fancyStars.checked = fancyStars;
    });
}
