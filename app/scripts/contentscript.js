import { Client } from 'chomex';
import jQuery from 'jquery';
import lodash from 'lodash';
import numeral from 'numeral';
import ParseGithubURL from 'parse-github-url';

import { TextColor } from './constants';

// Constants //

const COLORS = {
  BLUE: 'blue',
  ORANGE: 'orange',
  WHITE: 'white',
  YELLOW: 'yellow',
};

const STYLES = {
  STAR: {
    'background-color': 'transparent',
    margin: '0 .25rem 0 0',
  },
  TAG: {
    'background-color': '#3F3F3F',
    'border-radius': '.78125rem',
    'font-size': '.75rem',
    margin: '0 0 0 .25rem',
    padding: '.3125rem .625rem .3125rem .4375rem',
  },
};

// Chrome Message Client //

const client = new Client(chrome.runtime);

// Local Functions //

function starPathFromColor(rawColor) {
  const availableColors = lodash.values(COLORS);
  const color = lodash.includes(availableColors, rawColor) ? rawColor : COLORS.BLUE;
  return chrome.extension.getURL(`images/star-${color}.svg`);
}

function colorsFromStarCount(starCount) {
  switch (true) {
    case (starCount >= 10000):
      return { star: COLORS.ORANGE, text: TextColor.ORANGE };
    case (starCount < 10000 && starCount >= 5000):
      return { star: COLORS.YELLOW, text: TextColor.YELLOW };
    case (starCount < 5000 && starCount >= 1000):
      return { star: COLORS.WHITE, text: TextColor.WHITE };
    default:
      return { star: COLORS.BLUE, text: TextColor.BLUE };
  }
}

async function appendStarTagAsync(el, owner, name) {
  const $count = jQuery('<span>').text('...');

  const $star = jQuery('<img>')
    .css(STYLES.STAR)
    .attr('src', starPathFromColor(COLORS.WHITE));

  const $tag = jQuery('<span>')
    .css({ ...STYLES.TAG, color: TextColor.WHITE })
    .append($star).append($count);

  jQuery(el).after($tag);

  const { data: starCount } = await client.message('/stars/get', { owner, name });
  const formattedStarCount = starCount > 0 ? numeral(starCount).format('0,0') : 'N/A';

  const { star, text } = colorsFromStarCount(starCount);
  $star.css(STYLES.STAR).attr('src', starPathFromColor(star));
  $tag.css({ ...STYLES.TAG, color: text });

  $count[0].innerHTML = formattedStarCount;
}

async function iterateAllLinks() {
  const linkInListElems = jQuery('li > a', '#readme');

  const elemParsedUrls = lodash.reduce(linkInListElems, (acc, elem) => {
    const rawUrl = jQuery(elem).attr('href');
    const parsedUrl = ParseGithubURL(rawUrl);

    let newAcc = acc;
    if (parsedUrl && parsedUrl.host === 'github.com' && parsedUrl.repo) {
      newAcc = lodash.concat(acc, { elem, parsedUrl });
    }

    return newAcc;
  }, []);

  async function elementIteratee(elemParsedUrl) {
    const { elem, parsedHref: { owner, name } } = elemParsedUrl;
    return appendStarTagAsync(elem, owner, name);
  }

  lodash.each(elemParsedUrls, elementIteratee);
}

// Event Listeners //

jQuery(document).ready(() => {
  if (window.location.href.match(/awesome/i)) {
    iterateAllLinks();
  }
});
