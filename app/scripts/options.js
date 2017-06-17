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

// Exported Functions //

function fetchAccessTokenAsync(Elem) {
  return client
    .message('/access-token/get')
    .then(({ data }) => Elem.ACCESS_TOKEN_FIELD.val(data));
}

function fetchRateLimitAsync(Elem) {
  return client
    .message('/rate-limit')
    .then((response) => {
      const { remaining, limit } = response.data;
      const formattedRateLimit = numeral(remaining).format('0,0');

      if (limit === 0) {
        Elem.ACCESS_TOKEN_INVALID.show();
      }

      let percentage = 0;
      if (limit > 0) {
        Elem.ACCESS_TOKEN_INVALID.hide();
        percentage = parseInt((remaining / limit) * 100, 10);
      }

      const finalBGColor = colorFromPercentage(percentage);
      const textStyle = { color: finalBGColor };
      const $progressBarFilled = Elem.PROGRESS_BAR_FILLED;
      $progressBarFilled.css({ width: '0%' });
      anime({
        targets: $progressBarFilled.get(0),
        backgroundColor: finalBGColor,
        easing: 'easeInOutQuad',
        width: `${percentage}%`,
        begin: () => Elem.PROGRESS_BAR_TEXT.css(textStyle).text(formattedRateLimit),
      });
    });
}

function sendAccessTokenAsync(Elem) {
  const accessToken = Elem.ACCESS_TOKEN_FIELD.val();

  return client.message('/access-token/set', { accessToken })
    .then(() => {
      const $accessTokenSaveButton = Elem.ACCESS_TOKEN_SAVE_BUTTON;
      const origin = $accessTokenSaveButton.text();
      $accessTokenSaveButton.text('saved!');
      setTimeout(() => $accessTokenSaveButton.text(origin), 750);
    })
    .then(exports.fetchAccessTokenAsync(Elem))
    .then(exports.fetchRateLimitAsync(Elem));
}

// Event Listeners //

jQuery(document).ready(() => {
  const Elem = {
    ACCESS_TOKEN_FIELD: jQuery('#access-token-field'),
    ACCESS_TOKEN_INVALID: jQuery('.access-token-invalid'),
    ACCESS_TOKEN_SAVE_BUTTON: jQuery('#access-token-save-button'),
    PROGRESS_BAR_FILLED: jQuery('.progress-bar-filled'),
    PROGRESS_BAR_TEXT: jQuery('.progress-bar-text'),
  };

  Elem.ACCESS_TOKEN_INVALID.hide();
  Elem.ACCESS_TOKEN_SAVE_BUTTON.click(() => sendAccessTokenAsync(Elem));

  fetchAccessTokenAsync(Elem);
  fetchRateLimitAsync(Elem);
});
