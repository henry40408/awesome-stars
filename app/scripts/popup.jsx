import 'normalize-css/normalize.css';

import ChromePromise from 'chrome-promise';
import React from 'react';
import ReactDOM from 'react-dom';

import {
    GET_OPTIONS,
    RATE_LIMIT
} from './constants';

// INITIAL

const chromep = new ChromePromise();
const doc = document;

// EVENT HANDLERS

doc.addEventListener("DOMContentLoaded", main);

function main() {
    return ReactDOM.render(<App />, doc.getElementById('app'));
}

// COMPONENTS

class App extends React.Component {
    constructor(props) {
        super(props);

        this.handleOpenOptions = this.handleOpenOptions.bind(this);

        this.state = {
            rateLimit: 0,
            rateLimitRemaining: 0,
            tokenUsed: false
        }
    }

    componentDidMount() {
        return chromep.runtime.sendMessage({
            type: RATE_LIMIT
        }).then(response => {
            this.setState({
                rateLimit: response.limit,
                rateLimitRemaining: response.remaining
            })

            return chromep.runtime.sendMessage({
                type: GET_OPTIONS
            });
        }).then(response => {
            const {
                accessToken
            } = response;

            this.setState({
                tokenUsed: !!accessToken
            });
        });
    }

    handleOpenOptions() {
        return chromep.runtime.openOptionsPage();
    }

    render() {
        const {
            rateLimit,
            rateLimitRemaining,
            tokenUsed
        } = this.state;

        const tokenUsedStr = tokenUsed ? 'YES' : 'NO';
        const tokenUsedStyle = {
            color: tokenUsed ? 'green' : 'red'
        };

        return (
            <div>
                <h1 className="extension name">{'Awesome Stars'}</h1>
                <div className="statistics">
                    <div className="row">
                        <div className="name">{'Token Used?'}</div>
                        <div className="token used value" style={tokenUsedStyle}><span>{tokenUsedStr}</span></div>
                    </div>
                    <div className="row">
                        <div className="name">{'Current Rate Limit'}</div>
                        <div className="value">
                            <span>{rateLimitRemaining}</span>
                            {'/'}
                            <span>{rateLimit}</span>
                        </div>
                    </div>
                </div>
                <div className="open options"><a href="javascript: void 0;" onClick={this.handleOpenOptions}>{'Create a Token'}</a></div>
            </div>
        );
    }
}
