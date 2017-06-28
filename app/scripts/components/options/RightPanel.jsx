import autobind from 'autobind-decorator';
import React from 'react';
import styled from 'styled-components';

import { ERROR } from '../../common';
import { SHeader, SText } from '../common';
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

const SSubheader = SHeader.extend`
  font-size: ${rem(16)};
  margin: 0 0 ${rem(8)};
  text-transform: none;
`;

class RightPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { accessToken: '', limit: 0, remaining: 0 };
  }

  componentWillMount() {
    return this.updateRateLimit();
  }

  @autobind
  updateRateLimit() {
    return client.message('/rate-limit')
      .then(({ data }) => {
        if (data === ERROR) {
          this.setState({ limit: 0, remainig: 0 });
        } else {
          const { limit, remaining } = data;
          this.setState({ limit, remaining });
        }
      });
  }

  render() {
    const { limit, remaining } = this.state;
    return (
      <div>
        <SSection>
          <SHeader>{'Setup Access Token'}</SHeader>
          <AccessTokenForm />
          <SText>{'Get an access token from GitHub settings page'}</SText>
          <SText>{'Please DO NOT select any scopes!'}</SText>
        </SSection>
        <SSection>
          <SHeader>{'Rate Limit'}</SHeader>
          <RateLimit limit={limit} remaining={remaining} />
          <SSubheader>{'Why do You Need an Access Token?'}</SSubheader>
          <SSmallText>{'According to GitHub documentation. For unauthenticated requests, the rate limit allows you to make up to 60 requests per hour. Unauthenticated requests are associated with your IP address, and not the user making requests. Awesome Stars can only works properly with an access token.'}</SSmallText>
        </SSection>
      </div>
    );
  }
}

export default RightPanel;
