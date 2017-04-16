import ChromePromise from 'chrome-promise';
import ParseGithubUrl from 'parse-github-url';
import jQuery from 'jquery';
import lodash from 'lodash';

import { GET_OPTIONS, GET_STARS } from './constants';

const chromep = new ChromePromise();

function transformElementToLink(element) {
  const parsed = ParseGithubUrl(element.href) || {};
  const isInPage = (parsed.hash || '') !== '';
  const isRepo = (parsed.host || '').match(/github\.com/i);

  return { parsed, el: element, isInPage, isRepo };
}

function backgroundColorFromStars(stars, fancyStars) {
  if (!fancyStars) {
    return 'grey';
  }

  let backgroundColor;

  if (stars >= 10000) {
    backgroundColor = 'red';
  } else if (stars >= 5000) {
    backgroundColor = 'blue';
  } else if (stars >= 1000) {
    backgroundColor = 'green';
  } else {
    backgroundColor = 'grey';
  }

  return backgroundColor;
}

function starElement(stars, fancyStars) {
  const backgroundColor = backgroundColorFromStars(stars, fancyStars);
  const labelDiv = jQuery('<span>').addClass('stars name').append('stars');
  const starsDiv = jQuery('<span>').addClass(`stars value ${backgroundColor}`).append(stars);
  return jQuery('<span>').addClass('stars').append(labelDiv).append(starsDiv);
}

function appendGithubStarsWithOptions(options) {
  return function appendGithubStars(link) {
    const { fancyStars } = options;
    const { parsed, el } = link;

    return chromep.runtime
      .sendMessage({ type: GET_STARS, url: parsed.href })
      .then(stars => jQuery(el).after(starElement(stars, fancyStars)).after('&nbsp;'));
  };
}

function isRepoInsteadOfInPage(link) {
  return !link.isInPage && link.isRepo;
}

function parseLinks() {
  const readmeSection = document.getElementById('readme');

  // - Wrap elements into Links
  // - Filter GitHub repository and in-page links from Links
  // - Append ellipsis to the element in Links and transform Link into Promise
  //    - Promise would resolve ellipsis into GitHub buttons
  return chromep.runtime.sendMessage({ type: GET_OPTIONS })
    .then(options => lodash.chain(jQuery('a', readmeSection))
      .map(transformElementToLink)
      .filter(isRepoInsteadOfInPage)
      .map(appendGithubStarsWithOptions(options))
      .value());
}

function main() {
  const parsedUrl = ParseGithubUrl(window.location.href) || {};
  const readmeSection = document.getElementById('readme');

  const isAwesomeList = (parsedUrl.name || '').match(/awesome/i);
  if (isAwesomeList) {
    if (readmeSection) {
      const repoName = lodash.get(parsedUrl, 'name', '');

      parseLinks({
        repoName,
      });
    }
  }
}

main();
