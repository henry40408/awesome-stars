import lodash from 'lodash';
import ChromePromise from 'chrome-promise';
import React from 'react';
import ReactDOM from 'react-dom';

import { RATE_LIMIT, TEST_TOKEN, TOKEN } from './constants';

// INITIAL

const LOADING = 'LOADING';
const NA = 'NA';

const chromep = new ChromePromise();
const doc = document;

// EVENT HANDLERS

function main() {
  ReactDOM.render(<App />, doc.getElementById('app'));
  return true;
}

doc.addEventListener('DOMContentLoaded', main);

// COMPONENTS

class App extends React.Component {
  static handleOpenOptions() {
    return chromep.runtime.openOptionsPage();
  }

  static fromTokenStatus(tokenStatus) {
    let tokenStatusColor;
    let tokenStatusStr;

    switch (tokenStatus) {
      case LOADING:
        tokenStatusColor = 'black';
        tokenStatusStr = '...';
        break;
      case TOKEN.VALID:
        tokenStatusColor = 'green';
        tokenStatusStr = 'valid';
        break;
      case TOKEN.INVALID:
        tokenStatusColor = 'red';
        tokenStatusStr = 'invalid';
        break;
      case TOKEN.EMPTY:
        tokenStatusColor = 'black';
        tokenStatusStr = 'not set';
        break;
      default:
        tokenStatusColor = 'black';
        tokenStatusStr = 'unknown';
    }

    return {
      tokenStatusColor,
      tokenStatusStr,
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      rateLimit: NA,
      rateLimitRemaining: 0,
      tokenStatus: LOADING,
    };
  }

  componentDidMount() {
    return chromep.runtime
      .sendMessage({ type: TEST_TOKEN })
      .then((response) => {
        this.setState({ tokenStatus: response });

        if ([TOKEN.EMPTY, TOKEN.VALID].indexOf(response) >= 0) {
          return chromep.runtime
            .sendMessage({ type: RATE_LIMIT }).then((rateLimit) => {
              this.setState({
                rateLimit: rateLimit.limit,
                rateLimitRemaining: rateLimit.remaining,
              });
            });
        }

        return this.setState({ rateLimit: NA });
      });
  }

  render() {
    const { rateLimit, rateLimitRemaining, tokenStatus } = this.state;
    const { tokenStatusColor, tokenStatusStr } = App.fromTokenStatus(tokenStatus);
    const tokenStatusStyle = { color: tokenStatusColor };
    const rateLimitStr = rateLimit === NA ? 'N/A' : `${rateLimitRemaining} / ${rateLimit}`;
    const rateLimitPerc = parseInt((rateLimitRemaining / rateLimit) * 100, 10);
    const rateLimitPercStr = lodash.isNaN(rateLimitPerc) ? '' : ` (${rateLimitPerc}%)`;

    return (
      <div>
        <h1 className="extension name">{'Awesome Stars'}</h1>
        <div className="statistics">
          <div className="row">
            <div className="name">{'Token Status'}</div>
            <div className="token used value" style={tokenStatusStyle}>
              <span>{tokenStatusStr}</span>
            </div>
          </div>
          <div className="row">
            <div className="name">{'Current Rate Limit'}</div>
            <div className="value">{`${rateLimitStr}${rateLimitPercStr}`}</div>
          </div>
        </div>
        <div className="open options">
          <button onClick={App.handleOpenOptions}>
            <i className="fa fa-wrench" />
            {' Settings'}
          </button>
        </div>
      </div>
    );
  }
}
