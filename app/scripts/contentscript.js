import lodash from 'lodash';
import Bluebird from 'bluebird';

import jQuery from 'jquery';
import ParseGithubUrl from 'parse-github-url';

function main() {
    const parsedUrl = ParseGithubUrl(window.location.href) || {};
    const readmeSection = document.getElementById('readme');

    const isAwesomeList = (parsedUrl.name || '').match(/awesome/i);
    if (isAwesomeList) {
        if (readmeSection) {
            const repoName = lodash.get(parsedUrl, 'name', '');
            parseLinks({
                repoName
            });
        }
    }
}

function parseLinks({
    repoName
}) {
    console.log(`Awesome List detected: ${repoName}`);

    const readmeSection = document.getElementById('readme');

    // - Wrap elements into Links
    // - Filter GitHub repository and in-page links from Links
    // - Append ellipsis to the element in Links and transform Link into Promise
    //    - Promise would resolve ellipsis into GitHub buttons
    const linkElements = lodash.chain(jQuery('a', readmeSection))
        .map(transformElementToLink(repoName))
        .filter(isRepoInsteadOfInPage)
        .map(appendGithubStars)
        .value();

    console.log(`${linkElements.length} of repository detected`);
}

function transformElementToLink(repoName) {
    return function(element) {
        const parsedHref = ParseGithubUrl(element.href) || {};
        const isInPage = (parsedHref.hash || '') !== '';
        const isRepo = (parsedHref.host || '').match(/github\.com/i);

        return {
            ...parsedHref,
            el: element,
            isInPage,
            isRepo,
        };
    };
}

function isRepoInsteadOfInPage(link) {
    return !link.isInPage && link.isRepo;
}

function appendGithubStars(link) {
    const {
        owner,
        name
    } = link;

    const shieldUrl = `https://img.shields.io/github/stars/${owner}/${name}.png?style=social&label=Star`;
    const stars = jQuery('<img>').attr('src', shieldUrl);
    const el = jQuery(link.el).after(stars).after('&nbsp;');

    return {
        ...link,
        el,
    };
}

console.log('\'Allo \'Allo! Content script');

main();