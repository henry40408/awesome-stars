import { all, map } from 'bluebird';
import { Client } from 'chomex';
import jQuery from 'jquery';
import chunkize from 'lodash/chunk';
import concat from 'lodash/concat';
import includes from 'lodash/includes';
import reduce from 'lodash/reduce';
import values from 'lodash/values';
import numeral from 'numeral';
import ParseGithubURL from 'parse-github-url';

import { ERROR, TextColor, log } from './common';

const CHUNK_SIZE = 200;

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

const messageClient = new Client(chrome.runtime);

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

function isGithubLink(parsedUrl) {
  return parsedUrl && parsedUrl.host === 'github.com' && parsedUrl.owner && parsedUrl.name;
}

function starPathFromColor(rawColor) {
  const availableColors = values(COLORS);
  const color = includes(availableColors, rawColor) ? rawColor : COLORS.BLUE;
  return chrome.extension.getURL(`images/star-${color}.svg`);
}

function appendStarAsync(owner, name, elems) {
  const { $count, $star, $tag } = elems;

  return messageClient.message('/stars/get', { owner, name, updateRateLimit: false })
    .then((response) => {
      const { data: starCountOrError } = response;

      if (starCountOrError === ERROR) {
        return $count.text('N/A');
      }

      const formattedStarCount = starCountOrError > 0 ? numeral(starCountOrError).format('0,0') : 'N/A';

      const { star, text } = colorsFromStarCount(starCountOrError);
      $star.css(STYLES.STAR).attr('src', starPathFromColor(star));
      $tag.css({ ...STYLES.TAG, color: text });
      return $count.text(formattedStarCount);
    });
}

function appendPlaceholder(elem, owner, name) {
  const $count = jQuery('<span>').text('...');

  const $star = jQuery('<img>')
    .css(STYLES.STAR)
    .attr('src', starPathFromColor(COLORS.WHITE));

  const $tag = jQuery('<span>')
    .css({ ...STYLES.TAG, color: TextColor.WHITE })
    .append($star).append($count);

  jQuery(elem).after($tag);

  return appendStarAsync(owner, name, { $count, $star, $tag });
}

function iterateChunkAsync(chunk) {
  return all(map(chunk, ($linkWithParsedURL) => {
    const { $link, parsedURL: { owner, name } } = $linkWithParsedURL;
    return appendPlaceholder($link, owner, name);
  }));
}

function initAwesomeStars() {
  const $links = jQuery('li > a', '#readme');

  const $linksWithParsedURLs = reduce($links, (acc, $link) => {
    const rawURL = jQuery($link).attr('href');
    const parsedURL = ParseGithubURL(rawURL);
    return isGithubLink(parsedURL) ? concat(acc, { $link, parsedURL }) : acc;
  }, []);

  const chunks = chunkize($linksWithParsedURLs, CHUNK_SIZE);
  map(chunks, chunk => iterateChunkAsync(chunk).then(() =>
    messageClient.message('/rate-limit')));
}

async function checkAwesomeList() {
  const currentURL = window.location.href;
  const parsedURL = ParseGithubURL(currentURL);

  if (!isGithubLink(parsedURL)) {
    return false;
  }

  const { owner, name } = parsedURL;
  const { data: awesomeList } = await messageClient.message('/awesome-list/get');
  const isAwesomeList = awesomeList.indexOf(`${owner}/${name}`) >= 0;

  if (isAwesomeList) {
    log(`awesome list ${owner}/${name} detected`);
    initAwesomeStars();
    return true;
  }

  return false;
}

checkAwesomeList();
