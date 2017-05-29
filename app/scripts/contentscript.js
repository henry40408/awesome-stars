import Bluebird from 'bluebird';
import { Client } from 'chomex';
import jQuery from 'jquery';
import lodash from 'lodash';
import numeral from 'numeral';
import ParseGithubURL from 'parse-github-url';

import { TextColor } from './constants';

const CHUNK_LEN = 20;

const Color = {
  BLUE: 'blue',
  ORANGE: 'orange',
  WHITE: 'white',
  YELLOW: 'yellow',
};

const Style = {
  STAR: {
    'background-color': 'transparent',
    margin: '0 .25rem 0 0',
  },
  TAG: {
    'background-color': '#3F3F3F',
    'border-radius': '12.5px',
    'font-size': '.75rem',
    margin: '0 0 0 .25rem',
    padding: '5px 7px',
  },
};

const client = new Client(chrome.runtime);

// Local Functions //

function starFromColor(rawColor) {
  const available = lodash.values(Color);

  let color = rawColor;
  if (!lodash.includes(available, color)) {
    color = Color.BLUE;
  }

  return chrome.extension.getURL(`images/star-${color}.svg`);
}

function colorsFromStarCount(starCount) {
  switch (true) {
    case (starCount >= 10000):
      return { star: Color.ORANGE, text: TextColor.ORANGE };
    case (starCount < 10000 && starCount >= 5000):
      return { star: Color.YELLOW, text: TextColor.YELLOW };
    case (starCount < 5000 && starCount >= 1000):
      return { star: Color.WHITE, text: TextColor.WHITE };
    default:
      return { star: Color.BLUE, text: TextColor.BLUE };
  }
}

function appendStarTagAsync(el, owner, name) {
  const $count = jQuery('<span>').text('...');
  const $star = jQuery('<img>')
    .css(Style.STAR)
    .attr('src', starFromColor(Color.WHITE));
  const $tag = jQuery('<span>')
    .css({ ...Style.TAG, color: TextColor.WHITE })
    .append($star).append($count);

  jQuery(el).after($tag);

  return client.message('/stars/get', { owner, name })
    .then((response) => {
      const starCount = response.data;

      let formattedStarCount = 'N/A';
      if (starCount > 0) {
        formattedStarCount = numeral(starCount).format('0,0');
      }

      $star.css(Style.STAR).attr('src', starFromColor(colorsFromStarCount(starCount).star));
      $tag.css({ ...Style.TAG, color: colorsFromStarCount(starCount).text });
      $count.text(formattedStarCount);
    });
}

function iterateAllLinks() {
  const aElements = jQuery('li > a', '#readme');

  const validElements = lodash.reject(aElements, (el) => {
    const href = jQuery(el).attr('href');
    const parsedHref = ParseGithubURL(href);
    return lodash.isNull(parsedHref) ||
      parsedHref.host !== 'github.com' ||
      lodash.isNull(parsedHref.repo);
  });

  const grouped = lodash.chunk(validElements, CHUNK_LEN);

  // NOTE
  // 1. iterates groups one by one
  // 2. iterates elements in group synchronously
  return Bluebird.mapSeries(grouped, group => Bluebird.map(group, (el) => {
    const href = jQuery(el).attr('href');
    const { owner, name } = ParseGithubURL(href);
    return appendStarTagAsync(el, owner, name);
  }));
}

// Event Listeners //

jQuery(document).ready(() => {
  if (window.location.href.match(/awesome/i)) {
    iterateAllLinks();
  }
});
