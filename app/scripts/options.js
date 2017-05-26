import lodash from 'lodash';
import numeral from 'numeral';

import { Client } from 'chomex';
import $ from 'jquery';
import anime from 'animejs';

const Color = {
  RED: '#ff3e00',
  ORANGE: '#ecab20',
  GREEN: '#d4fc45',
};

$(window).bind('load', () => {
  const client = new Client(chrome.runtime);

  const Elem = {
    ACCESS_TOKEN_FIELD: $('#access-token-field'),
    ACCESS_TOKEN_SAVE_BUTTON: $('#access-token-save-button'),
    PROGRESS_BAR_TEXT: $('.progress-bar-text'),
  };

  function fetchAccessTokenAsync() {
    return client.message('/access-token/get').then((response) => {
      if (lodash.isString(response.data)) {
        Elem.ACCESS_TOKEN_FIELD.val(response.data);
      }
    });
  }

  function fetchRateLimitAsync() {
    return client.message('/rate-limit')
      .then((response) => {
        const { remaining, limit } = response.data;
        const percent = parseInt((remaining / limit) * 100, 10);

        let finalBGColor;
        switch (true) {
          case (percent < 2):
            finalBGColor = Color.RED;
            break;
          case (percent >= 2 && percent < 48):
            finalBGColor = Color.ORANGE;
            break;
          default:
            finalBGColor = Color.GREEN;
        }

        anime({
          targets: '.progress-bar-filled',
          backgroundColor: finalBGColor,
          easing: 'easeInOutQuad',
          width: `${percent}%`,
          begin: () => {
            Elem.PROGRESS_BAR_TEXT
              .css({ color: finalBGColor })
              .text(`${numeral(remaining).format('0,0')}`);
          },
        });
      });
  }

  Elem.ACCESS_TOKEN_SAVE_BUTTON.click(() => {
    const accessToken = Elem.ACCESS_TOKEN_FIELD.val();
    if (!lodash.isEmpty(accessToken)) {
      client.message('/access-token/set', { accessToken }).then(fetchAccessTokenAsync);
    }
  });

  fetchAccessTokenAsync();
  fetchRateLimitAsync();
});
