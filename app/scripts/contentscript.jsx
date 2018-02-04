import { all, map } from 'bluebird';
import { Client } from 'chomex';
import chunkize from 'lodash/chunk';
import concat from 'lodash/concat';
import each from 'lodash/each';
import includes from 'lodash/includes';
import isNull from 'lodash/isNull';
import reduce from 'lodash/reduce';
import values from 'lodash/values';
import numeral from 'numeral';
import ParseGithubURL from 'parse-github-url';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

import { version } from '../../package.json';
import { ERROR, log } from './common';
import colors from './themes/colors';

const CHUNK_SIZE = 20;

const STAR_COLORS = {
  BLUE: 'blue',
  ORANGE: 'orange',
  WHITE: 'white',
  YELLOW: 'yellow',
};

const SStarIcon = styled.img`
  background-color: transparent !important;
  margin: 0 4rem 0 0;
`;

const SStarTag = styled.span`
  background-color: ${colors.gray};
  border-radius: 12rem;
  font-size: 12rem;
  margin: 0 0 0 4rem;
  padding: 4rem 8rem;
`;

const messageClient = new Client(chrome.runtime);

function parseGithubURL(url) {
  const parsed = ParseGithubURL(url);

  if (parsed && parsed.host === 'github.com' && parsed.owner && parsed.name) {
    return parsed;
  }

  return null;
}

class Star extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    owner: PropTypes.string,
  }

  static defaultProps = {
    name: '',
    owner: '',
  }

  static colorsFromStarCount(count) {
    switch (true) {
      case (count >= 10000):
        return { star: STAR_COLORS.ORANGE, text: colors.orange };
      case (count < 10000 && count >= 5000):
        return { star: STAR_COLORS.YELLOW, text: colors.yellow };
      case (count < 5000 && count >= 1000):
        return { star: STAR_COLORS.WHITE, text: colors.white };
      default:
        return { star: STAR_COLORS.BLUE, text: colors.lightBlue };
    }
  }

  static starPathFromColor(raw) {
    const available = values(STAR_COLORS);
    const color = includes(available, raw) ? raw : STAR_COLORS.BLUE;
    return chrome.extension.getURL(`images/star-${color}.svg`);
  }

  constructor(props) {
    super(props);
    this.state = { count: null };
  }

  componentWillMount() {
    const { owner, name } = this.props;
    const options = { owner, name, updateRateLimit: false };
    return messageClient.message('/stars/get', options)
      .then(({ data }) => this.setState({ count: data }));
  }

  render() {
    const { count } = this.state;

    if (count === ERROR) {
      return (
        <SStarTag>
          <SStarIcon src={Star.starPathFromColor(STAR_COLORS.BLUE)} />
          <span style={{ color: colors.lightBlue }}>{'N/A'}</span>
        </SStarTag>
      );
    }

    const { star, text } = Star.colorsFromStarCount(count);
    const starIconPath = Star.starPathFromColor(star);
    const countText = isNull(count) ? '...' : numeral(count).format('0,0');
    return (
      <SStarTag>
        <SStarIcon src={starIconPath} />
        <span style={{ color: text }}>{countText}</span>
      </SStarTag>
    );
  }
}

function iterateChunkAsync(chunk) {
  return all(map(chunk, (linkWithParsed) => {
    const { link, parsed: { owner, name } } = linkWithParsed;
    const starNode = document.createElement('span');
    link.parentNode.insertBefore(starNode, link.nextSibling);
    ReactDOM.render(<Star owner={owner} name={name} />, starNode);
  }));
}

function preloadStarImages() {
  const starColors = values(STAR_COLORS);
  return each(starColors, (starColor) => {
    const image = new Image();
    image.src = Star.starPathFromColor(starColor);
  });
}

function initAwesomeStars() {
  preloadStarImages();

  const links = document.querySelectorAll('#readme li > a');
  const linksWithParsed = reduce(links, (acc, link) => {
    if (link.hash) {
      return acc;
    }

    const { href } = link;
    const parsed = parseGithubURL(href);
    return parsed ? concat(acc, { link, parsed }) : acc;
  }, []);

  const chunks = chunkize(linksWithParsed, CHUNK_SIZE);
  map(chunks, chunk => iterateChunkAsync(chunk).then(() =>
    messageClient.message('/rate-limit')));
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

const UpdateNotification = () => (
  <div>
    <div className="flash flash-full flash-notice">
      <div className="container">
        <button className="flash-close js-flash-close" type="button" aria-label="Dismiss this message">
          <svg aria-hidden="true" className="octicon octicon-x" height="16" version="1.1" viewBox="0 0 12 16" width="12">
            <path fillRule="evenodd" d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48z" />
          </svg>
        </button>
        <strong>{'Awesome Stars'}</strong>
        {' has been updated to '}
        <strong>{version}</strong>
        {'! For more information, please check out '}
        <strong><a href="https://github.com/henry40408/awesome-stars/blob/master/CHANGELOG.md">{'CHANGELOG'}</a></strong>
        {'.'}
      </div>
    </div>
  </div>
);

function showUpdateNotification() {
  const emptyContainer = document.createElement('div');
  const jsFlashContainer = document.getElementById('js-flash-container');
  jsFlashContainer.appendChild(emptyContainer);
  ReactDOM.render(<UpdateNotification />, emptyContainer);
}

async function checkUpdateNotificationSent() {
  const { data: updateNotificationSent } = await messageClient.message('/update-notification-sent/get');

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
