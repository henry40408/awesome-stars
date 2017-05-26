import lodash from 'lodash';
import numeral from 'numeral';

import $ from 'jquery';
import anime from 'animejs';

const Color = {
  RED: '#ff3e00',
  ORANGE: '#ecab20',
  GREEN: '#d4fc45',
};

$(window).bind('load', () => {
  const rateLimit = lodash.random(0, 5000);

  let finalBGColor;
  switch (true) {
    case (rateLimit < 100):
      finalBGColor = Color.RED;
      break;
    case (rateLimit >= 100 && rateLimit < 2400):
      finalBGColor = Color.ORANGE;
      break;
    default:
      finalBGColor = Color.GREEN;
  }

  const percent = parseInt((rateLimit / 5000) * 100, 10);
  anime({
    targets: '.progress-bar-filled',
    backgroundColor: finalBGColor,
    easing: 'easeInOutQuad',
    width: `${percent}%`,
    complete: () => {
      $('.progress-bar-text')
        .css({ color: finalBGColor })
        .text(`${numeral(rateLimit).format('0,0')}`);
    },
  });
});
