import ChromePromise from 'chrome-promise';
import React from 'react';
import ReactDOM from 'react-dom';
import lodash from 'lodash';

import {
    GET_OPTIONS,
    SET_OPTIONS,
    TEST_TOKEN,
    TOKEN
} from './constants';

// INITIAL

const ACCESS_TOKEN = 'ACCESS_TOKEN';
const FANCY_STARS = 'FANCY_STARS';
const LOADING = 'LOADING';

const chromep = new ChromePromise();
const doc = document;

// EVENT HANDLERS

doc.addEventListener('DOMContentLoaded', main);

function main() {
    ReactDOM.render(<App />, doc.getElementById('app'));
}

// COMPONENTS

class App extends React.Component {
    constructor(props) {
        super(props);

        this.handleAccessTokenChange = this.handleAccessTokenChange.bind(this);
        this.handleFancyStarsClick = this.handleFancyStarsClick.bind(this);
        this.setOptionsAsync = this.setOptionsAsync.bind(this);
        this.testTokenAsync = this.testTokenAsync.bind(this);

        this.state = {
            accessToken: '',
            fancyStars: false,
            saved: null,
            tokenStatus: LOADING
        };
    }

    componentDidMount() {
        return chromep.runtime.sendMessage({
            type: GET_OPTIONS
        }).then(response => {
            const {
                accessToken,
                fancyStars
            } = response;

            this.setState({
                accessToken,
                fancyStars
            });

            return this.testTokenAsync();
        });
    }

    handleAccessTokenChange(token) {
        this.setState({
            accessToken: token,
            tokenStatus: LOADING
        });

        return this.setOptionsAsync({
            accessToken: token
        }).then(() => {
            this.setState({
                saved: ACCESS_TOKEN
            });

            lodash.delay(() => this.setState({
                saved: null
            }), 1000);

            return this.testTokenAsync();
        });
    }

    handleFancyStarsClick(checked) {
        this.setState({
            fancyStars: checked
        });

        return this.setOptionsAsync({
            fancyStars: checked
        }).then(() => {
            this.setState({
                saved: FANCY_STARS
            });

            return lodash.delay(() => this.setState({
                saved: null
            }), 1000);
        });
    }

    setOptionsAsync(options) {
        const {
            accessToken,
            fancyStars
        } = this.state;

        return chromep.runtime.sendMessage({
            type: SET_OPTIONS,
            accessToken: lodash.get(options, 'accessToken', accessToken),
            fancyStars: lodash.get(options, 'fancyStars', fancyStars)
        });
    }

    testTokenAsync() {
        return chromep.runtime.sendMessage({
            type: TEST_TOKEN
        }).then(response => {
            this.setState({
                tokenStatus: response
            });
        });
    }

    render() {
        const {
            accessToken,
            fancyStars,
            saved,
            tokenStatus
        } = this.state;

        const accessTokenSaved = saved===ACCESS_TOKEN?'Saved!':'';
        const fancyStarsSaved=saved===FANCY_STARS?'Saved!':'';

        let tokenStatusColor,
            tokenStatusStyle,
            tokenStatusStr;

        switch (tokenStatus) {
            case LOADING:
                tokenStatusColor = 'black';
                tokenStatusStr = '...';
                break;
            case TOKEN.EMPTY:
                tokenStatusColor = 'black';
                tokenStatusStr = 'no token';
                break;
            case TOKEN.VALID:
                tokenStatusColor = 'green';
                tokenStatusStr = '\u2714 valid';
                break;
            case TOKEN.INVALID:
                tokenStatusColor = 'red';
                tokenStatusStr = '\u2718 invalid';
                break;
            default:
                tokenStatusColor = 'black';
                tokenStatusStr = 'unknown';
        }

        tokenStatusStyle = {
            color: tokenStatusColor
        };

        return (
            <div>
                <div>
                    <h1>{'Why a token?'}</h1>
                    <ul>
                        <li>
                            <strong>{'NO'}</strong>{' permission needs to be granted to the token.'}</li>
                        <li>
                            {'According to '}
                            <a href="https://developer.github.com/v3/#rate-limiting">{'GitHub Documentation'}</a>
                            {', only '}
                            <strong>{'60'}</strong>
                            {' requests is allowed to send in an hour, and it is not enough for getting star count for all repositories in a single awesome curated list.'}
                        </li>
                        <li>
                            {'With a token, the extension can send '}
                            <strong>{'5,000'}</strong>
                            {' requests instead. For better performance and user experience, the extension would also cache the result.'}
                        </li>
                    </ul>
                </div>
                <div>
                    <h1><a href="https://github.com/settings/tokens/new?description=Awesome%20Stars">{'Create a Token'}</a></h1>
                    <div>
                        {'NOTE: '}
                        <strong>{'NO'}</strong>
                        {' permissions is needed.'}
                    </div>
                </div>
                <p>
                    <label for="">
                        <h1>
                            {'GitHub Token '}
                            <small>{accessTokenSaved}</small>
                        </h1>
                        <input type="password" value={accessToken} placeholder="Paste the token" onChange={e => this.handleAccessTokenChange(e.target.value)} />
                        <p style={tokenStatusStyle}>{tokenStatusStr}</p>
                    </label>
                </p>
                <p>
                    <label for="">
                        <h1>
                            <span style={{ color: 'red' }}>{'F'}</span>
                            <span style={{ color: 'blue' }}>{'ancy '}</span>
                            <span style={{ color: 'green' }}>{'S'}</span>
                            {'tars '}
                            <small>{fancyStarsSaved}</small>
                        </h1>
                        <input type="checkbox" checked={fancyStars} onClick={e => this.handleFancyStarsClick(e.target.checked)}/>
                        {' Use different colors according to degrees of star count'}
                    </label>
                </p>
            </div>
        );
    }
}
