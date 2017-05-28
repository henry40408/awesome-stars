import $ from 'jquery';

import {
  fetchAccessTokenAsync,
  fetchRateLimitAsync,
  sendAccessTokenAsync,
} from './utils/options';

$(document).ready(() => {
  const Elem = {
    ACCESS_TOKEN_FIELD: $('#access-token-field'),
    ACCESS_TOKEN_INVALID: $('.access-token-invalid'),
    ACCESS_TOKEN_SAVE_BUTTON: $('#access-token-save-button'),
    PROGRESS_BAR_FILLED: $('.progress-bar-filled'),
    PROGRESS_BAR_TEXT: $('.progress-bar-text'),
  };

  Elem.ACCESS_TOKEN_INVALID.hide();
  Elem.ACCESS_TOKEN_SAVE_BUTTON.click(() => sendAccessTokenAsync(Elem));

  fetchAccessTokenAsync(Elem);
  fetchRateLimitAsync(Elem);
});
