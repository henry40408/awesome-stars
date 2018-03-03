/* eslint-disable no-restricted-syntax, no-await-in-loop */

import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

import { Client } from 'chomex';
import chunkize from 'lodash/chunk';
import ParseGithubURL from 'parse-github-url';

import checkAsync from './checkers';
import { log } from './common';
import Star from './components/Star';
import UpdateNotification from './components/UpdateNotification';

const CHUNK_SIZE = 20;
const messageClient = new Client(chrome.runtime);

class StarHOC extends React.Component {
  static propTypes = {
    owner: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  };

  state = { count: 0, hasError: false, loading: true };

  async updateCountAsync() {
    const { owner, name } = this.props;
    const { data: count } = await messageClient.message('/stars/get', { owner, name });
    this.setState({ count, loading: false });
  }

  render() {
    const { count, loading } = this.state;
    return <Star count={count} loading={loading} />;
  }
}

function parseGithubURL(url) {
  const parsed = ParseGithubURL(url);
  if (parsed && parsed.host === 'github.com' && parsed.owner && parsed.name) {
    return parsed;
  }
  return null;
}

function appendStars(tuples) {
  /** @type {Array<StarHOC>} */
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

async function initAwesomeStarsAsync() {
  /** @type {Array} */
  const links = [].slice.call(document.querySelectorAll('#readme li > a'));

  const tuples = links
    .filter(link => !link.hash)
    .filter(link => parseGithubURL(link.href))
    .map((link) => {
      const { owner, name } = parseGithubURL(link.href);
      return { link, owner, name };
    });

  const stars = appendStars(tuples);
  await batchUpdateCountAsync(stars);
}

async function checkAwesomeListAsync() {
  const parsed = parseGithubURL(window.location.href);
  if (!parsed) {
    return;
  }

  const { owner, name } = parsed;
  const options = { owner, name };
  const isAwesomeList = await checkAsync(options);
  if (isAwesomeList) {
    log(`awesome list ${owner}/${name} detected`);
    await initAwesomeStarsAsync();
  }
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
    await messageClient.message('/update-notification-sent/set', {
      updateNotificationSent: true,
    });
  }
}

checkUpdateNotificationSentAsync();
checkAwesomeListAsync();
