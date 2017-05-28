import anime from 'animejs';
import { Client } from 'chomex';
import numeral from 'numeral';

const Color = {
  RED: '#ff3e00',
  ORANGE: '#ecab20',
  GREEN: '#d4fc45',
};

const client = new Client(chrome.runtime);

// Local Functions //

function colorFromPercentage(percentage) {
  switch (true) {
    case (percentage < 2):
      return Color.RED;
    case (percentage >= 2 && percentage < 48):
      return Color.ORANGE;
    default:
      return Color.GREEN;
  }
}

// Exported Functions //

exports.fetchAccessTokenAsync = Elem => client
  .message('/access-token/get')
  .then(({ data }) => Elem.ACCESS_TOKEN_FIELD.val(data));

exports.fetchRateLimitAsync = Elem => client
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

exports.sendAccessTokenAsync = (Elem) => {
  const accessToken = Elem.ACCESS_TOKEN_FIELD.val();

  client.message('/access-token/set', { accessToken })
    .then(() => {
      const $accessTokenSaveButton = Elem.ACCESS_TOKEN_SAVE_BUTTON;
      const origin = $accessTokenSaveButton.text();
      $accessTokenSaveButton.text('saved!');
      setTimeout(() => $accessTokenSaveButton.text(origin), 750);
    })
    .then(exports.fetchAccessTokenAsync(Elem))
    .then(exports.fetchRateLimitAsync(Elem));
};
