import {
    RATE_LIMIT
} from './constants';

console.log('Awesome stars is ready');

const $rateLimitRemaining = document.getElementById('rate-limit-remaining'),
    $rateLimitLimit = document.getElementById('rate-limit-limit');

chrome.runtime.sendMessage({
    type: RATE_LIMIT
}, response => {
    $rateLimitLimit.innerHTML = response.limit;
    $rateLimitRemaining.innerHTML = response.remaining;
});
