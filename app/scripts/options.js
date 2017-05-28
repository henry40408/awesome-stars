import $ from 'jquery';

import {
  fetchAccessTokenAsync,
  fetchRateLimitAsync,
  sendAccessTokenAsync,
} from './utils/options';

$(document).ready(() => {
  const Elem = {
    ACCESS_TOKEN_FIELD: $('#access-token-field'),
    ACCESS_TOKEN_SAVE_BUTTON: $('#access-token-save-button'),
    PROGRESS_BAR_FILLED: $('.progress-bar-filled'),
    PROGRESS_BAR_TEXT: $('.progress-bar-text'),
  };

  Elem.ACCESS_TOKEN_SAVE_BUTTON.click(() => sendAccessTokenAsync(Elem.ACCESS_TOKEN_FIELD,
    Elem.ACCESS_TOKEN_SAVE_BUTTON));

  fetchAccessTokenAsync(Elem.ACCESS_TOKEN_FIELD);
  fetchRateLimitAsync(Elem.PROGRESS_BAR_FILLED, Elem.PROGRESS_BAR_TEXT);
});
