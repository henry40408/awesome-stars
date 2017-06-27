import React from 'react';

import AccessTokenForm from './AccessTokenForm';

const RightPanel = () => (
  <div>
    <div>
      <h2>{'Setup Access Token'}</h2>
      <AccessTokenForm />
      <div>{'Get an access token from GitHub settings page'}</div>
      <div>{'Please DO NOT select any scopes!'}</div>
    </div>
    <div>
      <h2>{'Rate Limit'}</h2>
      <h3>{'Why do You Need an Access Token?'}</h3>
      <div>{'According to GitHub documentation. For unauthenticated requests, the rate limit allows you to make up to 60 requests per hour. Unauthenticated requests are associated with your IP address, and not the user making requests. Awesome Stars can only works properly with an access token.'}</div>
    </div>
  </div>
);

export default RightPanel;
