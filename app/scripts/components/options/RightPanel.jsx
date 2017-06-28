import autobind from 'autobind-decorator';
import React from 'react';
import styled from 'styled-components';

import { ERROR } from '../../common';
import { Link, SSectionHeader, SText } from '../common';
import client from '../../services/client';
import { rem } from '../../services/scale';

import AccessTokenForm from './AccessTokenForm';
import RateLimit from './RateLimit';

const SSection = styled.div`
  margin: 0 0 ${rem(32)};
`;

const SSmallText = SText.extend`
  font-size: ${rem(12)};
`;

const SSubheader = SSectionHeader.extend`
  font-size: ${rem(16)};
  margin: 0 0 ${rem(8)};
  text-transform: none;
`;

class RightPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      accessToken: '',
      limit: -1,
      loading: false,
      remaining: -1,
    };
  }

  componentWillMount() {
    return this.fetchAccessTokenAsync()
      .then(() => this.fetchRateLimitAsync());
  }

  @autobind
  fetchAccessTokenAsync() {
    return client.message('/access-token/get').then(({ data }) => {
      this.setState({ accessToken: data });
    });
  }

  @autobind
  fetchRateLimitAsync() {
    return this.sendMessage('/rate-limit').then(({ data }) => {
      if (data === ERROR) {
        this.setState({ limit: 0, remainig: 0 });
      } else {
        const { limit, remaining } = data;
        this.setState({ limit, remaining });
      }
    });
  }

  @autobind
  sendMessage(route, message) {
    this.setState({ loading: true });
    return client.message(route, message).then((response) => {
      this.setState({ loading: false });
      return response;
    });
  }

  @autobind
  submitAccessTokenAsync() {
    const { accessToken } = this.state;
    return this.sendMessage('/access-token/set', { accessToken })
      .then(() => this.fetchRateLimitAsync());
  }

  @autobind
  updateAccessToken(accessToken) {
    this.setState({ accessToken });
  }

  render() {
    const { accessToken, limit, loading, remaining } = this.state;
    return (
      <div>
        <SSection>
          <SSectionHeader>{'Setup Access Token'}</SSectionHeader>
          <AccessTokenForm
            accessToken={accessToken}
            limit={limit}
            loading={loading}
            submitAccessTokenAsync={this.submitAccessTokenAsync}
            updateAccessToken={this.updateAccessToken}
          />
          <SText>
            <Link href="https://github.com/settings/tokens/new?description=Awesome%20Stars">{'Get an access token'}</Link>
            {' from '}
            <Link href="https://github.com/settings">{'GitHub settings page'}</Link>
          </SText>
          <SText alert>{'Please DO NOT select any scopes!'}</SText>
        </SSection>
        <SSection>
          <SSectionHeader>{'Rate Limit'}</SSectionHeader>
          <RateLimit limit={limit} remaining={remaining} />
          <SSubheader>{'Why do You Need an Access Token?'}</SSubheader>
          <SSmallText>
            {'According to '}
            <Link href="https://developer.github.com/v3/#rate-limiting">{'GitHub documentation'}</Link>
            {'. For unauthenticated requests, the rate limit allows you to make up to 60 requests per hour. Unauthenticated requests are associated with your IP address, and not the user making requests. Awesome Stars can only works properly with an access token.'}
          </SSmallText>
        </SSection>
      </div>
    );
  }
}

export default RightPanel;
