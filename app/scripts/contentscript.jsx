/* eslint-disable no-restricted-syntax, no-await-in-loop */

import React from 'react';
import ReactDOM from 'react-dom';

import { Client } from 'chomex';
import chunkize from 'lodash/chunk';
import ParseGithubURL from 'parse-github-url';

import { log } from './common';
import UpdateNotification from './components/UpdateNotification';
import StarHOC from './components/StarHOC';

const CHUNK_SIZE = 20;
const messageClient = new Client(chrome.runtime);

function parseGithubURL(url) {
  const parsed = ParseGithubURL(url);
  if (parsed && parsed.host === 'github.com' && parsed.owner && parsed.name) {
    const { host, owner, name } = parsed;
    return { valid: true, host, owner, name };
  }
  return { valid: false };
}

function appendStars(tuples) {
  /** @type {[StarHOC]} */
  const stars = [];

  for (const tuple of tuples) {
    const { link, owner, name } = tuple;
    const starNode = document.createElement('span');
    link.parentNode.insertBefore(starNode, link.nextSibling);
    ReactDOM.render(<StarHOC ref={star => stars.push(star)} owner={owner} name={name} />, starNode);
  }

  return stars;
}

async function batchUpdateCountAsync(stars) {
  const chunks = chunkize(stars, CHUNK_SIZE);
  for (const chunk of chunks) {
    await Promise.all(chunk.map(star => star.updateCountAsync()));
    await messageClient.message('/rate-limit');
  }
}

async function isAwesomeListAsync() {
  const parsed = parseGithubURL(window.location.href);
  if (!parsed) {
    return false;
  }

  const { owner, name } = parsed;
  const { data: isAwesomeList } = await messageClient.message('/awesome-list/check', {
    owner,
    name,
  });

  if (isAwesomeList) {
    log(`awesome list ${owner}/${name} detected`);
    return true;
  }

  return false;
}

async function initAwesomeStarsAsync() {
  const isAwesomeList = await isAwesomeListAsync();
  if (!isAwesomeList) {
    return;
  }

  /** @type {Array} */
  const links = [].slice.call(document.querySelectorAll('#readme li > a'));

  const tuples = links
    .filter(link => !link.hash)
    .map((link) => {
      const { valid, owner, name } = parseGithubURL(link.href);
      return { valid, link, owner, name };
    })
    .filter(tuple => tuple.valid);

  const stars = appendStars(tuples);
  await batchUpdateCountAsync(stars);
}

function showUpdateNotification() {
  const $emptyContainer = document.createElement('div');
  const $jsFlashContainer = document.getElementById('js-flash-container');
  $jsFlashContainer.appendChild($emptyContainer);
  ReactDOM.render(<UpdateNotification />, $emptyContainer);
}

async function checkUpdateNotificationSentAsync() {
  const { data: updateNotificationSent } = await messageClient.message(
    '/update-notification-sent/get',
  );

  if (!updateNotificationSent) {
    showUpdateNotification();
    messageClient.message('/update-notification-sent/set', {
      updateNotificationSent: true,
    });
  }
}

checkUpdateNotificationSentAsync();
initAwesomeStarsAsync();
