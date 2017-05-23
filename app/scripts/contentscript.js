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
    'margin': '0 .25rem 0 0',
  },
  TAG: {
    'background-color': '#3F3F3F',
    'border-radius': '12.5px',
    'color': 'white',
    'font-size': '.75rem',
    'margin': '0 .25rem',
    'padding': '5px 7px',
  }
};

function appendStarTag(el) {
  const $star = jQuery('<img>').css(Style.STAR).attr('src', StarURL.ORANGE);
  const $tag = jQuery('<span>').css(Style.TAG).append($star).append('1,048,576');
  return jQuery(el).after($tag);
}

jQuery(document).ready(() => {
  jQuery('a', '#readme').each(function () {
    const href = jQuery(this).attr('href');
    const parsedHref = ParseGithubURL(href);

    if (lodash.isNull(parsedHref)) {
      return;
    }

    if (lodash.isString(parsedHref.repo)) {
      console.log(parsedHref.repo);
      appendStarTag(this);
    }
  });
});
