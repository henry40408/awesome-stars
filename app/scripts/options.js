import jQuery from 'jquery';

import anime from 'animejs';
import { Client } from 'chomex';
import numeral from 'numeral';

import { TextColor } from './constants';

const client = new Client(chrome.runtime);

// Local Functions //

function colorFromPercentage(percentage) {
  switch (true) {
    case (percentage < 2):
      return TextColor.RED;
    case (percentage >= 2 && percentage < 48):
      return TextColor.ORANGE;
    default:
      return TextColor.GREEN;
  }
}

async function fetchAccessTokenAsync(elems) {
  const { data } = await client.message('/access-token/get');
  return elems.ACCESS_TOKEN_FIELD.val(data);
}

async function fetchRateLimitAsync(elems) {
  const response = await client.message('/rate-limit');
  const { remaining, limit } = response.data;
  const formattedRateLimit = numeral(remaining).format('0,0');

  let percentage = 0;

  if (limit > 0) {
    percentage = parseInt((remaining / limit) * 100, 10);
  }

  const finalbackgroundColor = colorFromPercentage(percentage);
  const textStyle = { color: finalbackgroundColor };
  const $progressBarFilled = elems.PROGRESS_BAR_FILLED;

  $progressBarFilled.css({ width: '0%' });

  anime({
    targets: $progressBarFilled.get(0),
    backgroundColor: finalbackgroundColor,
    easing: 'easeInOutQuad',
    width: `${percentage}%`,
    begin: () => elems.PROGRESS_BAR_TEXT.css(textStyle).text(formattedRateLimit),
  });
}

async function sendAccessTokenAsync(elems) {
  const accessToken = elems.ACCESS_TOKEN_FIELD.val();

  await client.message('/access-token/set', { accessToken });

  const $accessTokenSaveButton = elems.ACCESS_TOKEN_SAVE_BUTTON;
  const origin = $accessTokenSaveButton.text();
  $accessTokenSaveButton.text('saved!');
  setTimeout(() => $accessTokenSaveButton.text(origin), 750);

  await fetchAccessTokenAsync(elems);
  await fetchRateLimitAsync(elems);
}

// Event Listeners //

jQuery(document).ready(() => {
  const Elem = {
    ACCESS_TOKEN_FIELD: jQuery('#access-token-field'),
    ACCESS_TOKEN_SAVE_BUTTON: jQuery('#access-token-save-button'),
    PROGRESS_BAR_FILLED: jQuery('.progress-bar-filled'),
    PROGRESS_BAR_TEXT: jQuery('.progress-bar-text'),
  };

  Elem.ACCESS_TOKEN_SAVE_BUTTON.click(() => sendAccessTokenAsync(Elem));

  fetchAccessTokenAsync(Elem);
  fetchRateLimitAsync(Elem);
});
