import { all, map } from 'bluebird';
import { Client } from 'chomex';
import chunkize from 'lodash/chunk';
import concat from 'lodash/concat';
import reduce from 'lodash/reduce';
import ParseGithubURL from 'parse-github-url';
import React from 'react';
import ReactDOM from 'react-dom';

import { log } from './common';
import Star from './components/Star';
import UpdateNotification from './components/UpdateNotification';

const CHUNK_SIZE = 20;

const messageClient = new Client(chrome.runtime);

function parseGithubURL(url) {
  const parsed = ParseGithubURL(url);
  if (parsed && parsed.host === 'github.com' && parsed.owner && parsed.name) {
    return parsed;
  }
  return null;
}

function iterateChunkAsync(chunk) {
  return all(
    map(chunk, (linkWithParsed) => {
      const { link, parsed: { owner, name } } = linkWithParsed;
      const starNode = document.createElement('span');
      link.parentNode.insertBefore(starNode, link.nextSibling);
      ReactDOM.render(<Star owner={owner} name={name} />, starNode);
    }),
  );
}

function initAwesomeStars() {
  const links = document.querySelectorAll('#readme li > a');
  const linksWithParsed = reduce(
    links,
    (acc, link) => {
      if (link.hash) {
        return acc;
      }

      const { href } = link;
      const parsed = parseGithubURL(href);
      return parsed ? concat(acc, { link, parsed }) : acc;
    },
    [],
  );

  const chunks = chunkize(linksWithParsed, CHUNK_SIZE);
  map(chunks, chunk => iterateChunkAsync(chunk).then(() => messageClient.message('/rate-limit')));
}

async function checkAwesomeList() {
  const currentURL = window.location.href;
  const parsed = parseGithubURL(currentURL);

  if (!parsed) {
    return false;
  }

  const { owner, name } = parsed;
  const { data: awesomeList } = await messageClient.message('/awesome-list/get');
  const isAwesomeList = awesomeList.indexOf(`${owner}/${name}`) >= 0;

  if (isAwesomeList) {
    log(`awesome list ${owner}/${name} detected`);
    initAwesomeStars();
    return true;
  }

  return false;
}

function showUpdateNotification() {
  const emptyContainer = document.createElement('div');
  const jsFlashContainer = document.getElementById('js-flash-container');
  jsFlashContainer.appendChild(emptyContainer);
  ReactDOM.render(<UpdateNotification />, emptyContainer);
}

async function checkUpdateNotificationSent() {
  const { data: updateNotificationSent } = await messageClient.message(
    '/update-notification-sent/get',
  );

  if (!updateNotificationSent) {
    // NOTE send update notification when entering GitHub
    showUpdateNotification();

    return messageClient.message('/update-notification-sent/set', {
      updateNotificationSent: true,
    });
  }

  return true;
}

checkUpdateNotificationSent();
checkAwesomeList();
