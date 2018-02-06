import React from 'react';
import { storiesOf, addDecorator } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withKnobs, boolean, number, text } from '@storybook/addon-knobs';

import styled from 'styled-components';

import AccessTokenForm from '../scripts/components/AccessTokenForm';
import RateLimit from '../scripts/components/RateLimit';

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
    onSubmit={accessToken => action(`access token submitted: ${accessToken}`)}
  />
));
