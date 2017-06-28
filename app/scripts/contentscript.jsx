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

import { ERROR, TextColor, log } from './common';

const CHUNK_SIZE = 20;

const COLORS = {
  BLUE: 'blue',
  ORANGE: 'orange',
  WHITE: 'white',
  YELLOW: 'yellow',
};

const SStarIcon = styled.img`
  background-color: transparent !important;
  margin: 0 .25rem 0 0;
`;

const SStarTag = styled.span`
  background-color: #3F3F3F;
  border-radius: .78125rem;
  font-size: .75rem;
  margin: 0 0 0 .25rem;
  padding: .3125rem .625rem .3125rem .4375rem;
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
        return { star: COLORS.ORANGE, text: TextColor.ORANGE };
      case (count < 10000 && count >= 5000):
        return { star: COLORS.YELLOW, text: TextColor.YELLOW };
      case (count < 5000 && count >= 1000):
        return { star: COLORS.WHITE, text: TextColor.WHITE };
      default:
        return { star: COLORS.BLUE, text: TextColor.BLUE };
    }
  }

  static starPathFromColor(raw) {
    const available = values(COLORS);
    const color = includes(available, raw) ? raw : COLORS.BLUE;
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
          <SStarIcon src={Star.starPathFromColor(COLORS.BLUE)} />
          <span style={{ color: TextColor.BLUE }}>{'N/A'}</span>
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
  const colors = values(COLORS);
  return each(colors, (color) => {
    const image = new Image();
    image.src = Star.starPathFromColor(color);
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

checkAwesomeList();
