import lodash from 'lodash';
import ParseGithubURL from 'parse-github-url';
import jQuery from 'jquery';

// console.log('\'Allo \'Allo! Content script');

const StarURL = {
  ORANGE: chrome.extension.getURL('images/orange-star.svg'),
};

const Style = {
  STAR: {
    'background-color': 'transparent',
    margin: '0 .25rem 0 0',
  },
  TAG: {
    'background-color': '#3F3F3F',
    'border-radius': '12.5px',
    color: 'white',
    'font-size': '.75rem',
    margin: '0 0 0 .25rem',
    padding: '5px 7px',
  },
};

function appendStarTag(el) {
  const $star = jQuery('<img>').css(Style.STAR).attr('src', StarURL.ORANGE);
  const $tag = jQuery('<span>').css(Style.TAG).append($star).append('1,048,576');
  return jQuery(el).after($tag);
}

function iterateAllLinks() {
  const aElements = jQuery('li > a', '#readme');

  return lodash.each(aElements, (el) => {
    const href = jQuery(el).attr('href');
    const parsedHref = ParseGithubURL(href);

    if (!lodash.isNull(parsedHref)) {
      if (lodash.isString(parsedHref.repo)) {
        appendStarTag(el);
      }
    }
  });
}

jQuery(document).ready(() => {
  if (window.location.href.match(/awesome/i)) {
    iterateAllLinks();
  }
});
