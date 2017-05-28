import anime from 'animejs';
import { Client } from 'chomex';
import lodash from 'lodash';
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

exports.fetchAccessTokenAsync = $accessTokenField => client
  .message('/access-token/get')
  .then(({ data }) => $accessTokenField.val(data));

exports.fetchRateLimitAsync = ($progressBarFilled, $progressBarText) => client
  .message('/rate-limit')
  .then((response) => {
    const { remaining, limit } = response.data;
    const formattedRateLimit = numeral(remaining).format('0,0');
    const percentage = parseInt((remaining / limit) * 100, 10);
    const finalBGColor = colorFromPercentage(percentage);
    const textStyle = { color: finalBGColor };

    anime({
      targets: $progressBarFilled.get(0),
      backgroundColor: finalBGColor,
      easing: 'easeInOutQuad',
      width: `${percentage}%`,
      begin: () => $progressBarText.css(textStyle).text(formattedRateLimit),
    });
  });

exports.sendAccessTokenAsync = ($accessTokenField, $accessTokenSaveButton) => {
  const accessToken = $accessTokenField.val();

  if (lodash.isEmpty(accessToken)) {
    return;
  }

  client.message('/access-token/set', { accessToken })
    .then(() => {
      const origin = $accessTokenSaveButton.text();
      $accessTokenSaveButton.text('saved!');
      setTimeout(() => $accessTokenSaveButton.text(origin), 750);
    })
    .then(exports.fetchAccessTokenAsync($accessTokenField));
};
