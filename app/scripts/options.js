import lodash from 'lodash';
import ChromePromise from 'chrome-promise';

import {
    GET_OPTIONS,
    SET_OPTIONS,
    TEST_TOKEN,
    TOKEN
} from './constants';

// INITIAL

const chromep = new ChromePromise();
const doc = document;

// MAIN FUNCTIONS

doc.addEventListener('DOMContentLoaded', main);

function main() {
    const $accessToken = doc.getElementById('access-token');
    const $fancyStars = doc.getElementById('fancy-stars');

    const tokenHandler = setOptionsAsync('access-token-saved');
    const dTokenHandler = lodash.debounce(tokenHandler, 500);
    $accessToken.addEventListener('keyup', dTokenHandler);

    const fStarsHandler = setOptionsAsync('fancy-stars-saved');
    const dFStarsHandler = lodash.debounce(fStarsHandler, 500);
    $fancyStars.addEventListener('click', dFStarsHandler);

    testTokenAsync();

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

function setOptionsAsync(savedId) {
    return () => {
        const $saved = doc.getElementById(savedId);
        const $accessToken = doc.getElementById('access-token');
        const $fancyStars = doc.getElementById('fancy-stars');

        return chromep.runtime.sendMessage({
            type: SET_OPTIONS,
            accessToken: $accessToken.value,
            fancyStars: $fancyStars.checked
        }).then(() => {
            $saved.classList.remove('saved');
            lodash.delay(() => {
                $saved.classList.add('saved');
            }, 500);
            return testTokenAsync();
        });
    };
}

function testTokenAsync() {
    const $tokenStatus = doc.getElementById('token-status');

    $tokenStatus.style.color = 'black';
    $tokenStatus.innerHTML = '...';

    return chromep.runtime.sendMessage({
        type: TEST_TOKEN
    }).then(response => {
        if (response === TOKEN.EMPTY) {
            $tokenStatus.style.color = 'black';
            $tokenStatus.innerHTML = 'no token';
        } else if (response === TOKEN.VALID) {
            $tokenStatus.style.color = 'green';
            $tokenStatus.innerHTML = 'valid';
        } else if (response === TOKEN.INVALID) {
            $tokenStatus.style.color = 'red';
            $tokenStatus.innerHTML = 'invalid';
        } else {
            $tokenStatus.style.color = 'black';
            $tokenStatus.innerHTML = 'unknown';
        }
    });
}
