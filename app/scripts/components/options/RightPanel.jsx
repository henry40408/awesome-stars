import React from 'react';
import styled from 'styled-components';

import { SHeader, SText } from '../common';
import { rem } from '../../services/scale';
import AccessTokenForm from './AccessTokenForm';

const SSection = styled.div`
  margin: 0 0 ${rem(18)};
`;

const SSmallText = SText.extend`
  font-size: ${rem(12)};
`;

const SSubheader = SHeader.extend`
  font-size: ${rem(16)};
`;

const RightPanel = () => (
  <div>
    <SSection>
      <SHeader>{'Setup Access Token'}</SHeader>
      <AccessTokenForm />
      <SText>{'Get an access token from GitHub settings page'}</SText>
      <SText>{'Please DO NOT select any scopes!'}</SText>
    </SSection>
    <SSection>
      <SHeader>{'Rate Limit'}</SHeader>
      <SSubheader>{'Why do You Need an Access Token?'}</SSubheader>
      <SSmallText>{'According to GitHub documentation. For unauthenticated requests, the rate limit allows you to make up to 60 requests per hour. Unauthenticated requests are associated with your IP address, and not the user making requests. Awesome Stars can only works properly with an access token.'}</SSmallText>
    </SSection>
  </div>
);

export default RightPanel;
