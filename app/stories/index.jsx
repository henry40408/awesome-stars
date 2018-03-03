import React from 'react';
import { storiesOf, addDecorator } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withKnobs, boolean, number } from '@storybook/addon-knobs';

import styled from 'styled-components';

import AccessTokenForm from '../scripts/components/AccessTokenForm';
import RateLimit from '../scripts/components/RateLimit';
import Star from '../scripts/components/Star';
import UpdateNotification from '../scripts/components/UpdateNotification';

const MAXIMUM = 5000;

addDecorator(withKnobs);

const RateLimitContainer = styled.div`
  background-color: ${({ inverse }) => (inverse ? 'black' : 'white')};
  padding: 1rem 0;
`;

storiesOf('RateLimit', module).add('default', () => {
  const inverse = boolean('Inverse', false);

  return (
    <RateLimitContainer inverse={inverse}>
      <RateLimit
        inverse={inverse}
        remaining={number('Remaining', MAXIMUM)}
        total={number('Total', MAXIMUM)}
        heightInRem={number('Height in rem', 1)}
      />
    </RateLimitContainer>
  );
});

storiesOf('AccessTokenForm', module).add('default', () => (
  <AccessTokenForm
    accessToken="accessToken"
    heightInRem={number('Height in rem', 1)}
    invalid={boolean('Invalid', false)}
    onSubmit={accessToken => action(`access token submitted: ${accessToken}`)}
    saving={boolean('Saving', false)}
  />
));

storiesOf('Star', module).add('default', () => <Star count={number('Count', 1000)} />);

storiesOf('UpdateNotification', module).add('default', () => <UpdateNotification />);
