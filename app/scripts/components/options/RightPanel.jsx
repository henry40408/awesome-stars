import React from 'react';

import { SText } from '../common';
import AccessTokenForm from './AccessTokenForm';

const RightPanel = () => (
  <div>
    <div>
      <h2>{'Setup Access Token'}</h2>
      <AccessTokenForm />
      <SText>{'Get an access token from GitHub settings page'}</SText>
      <SText>{'Please DO NOT select any scopes!'}</SText>
    </div>
    <div>
      <h2>{'Rate Limit'}</h2>
      <h3>{'Why do You Need an Access Token?'}</h3>
      <SText>{'According to GitHub documentation. For unauthenticated requests, the rate limit allows you to make up to 60 requests per hour. Unauthenticated requests are associated with your IP address, and not the user making requests. Awesome Stars can only works properly with an access token.'}</SText>
    </div>
  </div>
);

export default RightPanel;
