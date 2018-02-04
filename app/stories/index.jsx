import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import AccessTokenForm from '../scripts/components/AccessTokenForm';
import RateLimit from '../scripts/components/RateLimit';

const MAXIMUM = 5000;

storiesOf('RateLimit', module)
  .add('default', () => <RateLimit />)
  .add('with remaining and total', () => (
    <div>
      <p>empty</p>
      <RateLimit remaining={0} total={MAXIMUM} />
      <p>1.9%</p>
      <RateLimit remaining={MAXIMUM * 0.019} total={MAXIMUM} />
      <p>49.9%</p>
      <RateLimit remaining={MAXIMUM * 0.499} total={MAXIMUM} />
      <p>total</p>
      <RateLimit remaining={MAXIMUM} total={MAXIMUM} />
    </div>
  ))
  .add('with heightInRem', () => (
    <div>
      <p>1</p>
      <RateLimit remaining={MAXIMUM} total={MAXIMUM} heightInRem={1} />
      <p>2</p>
      <RateLimit remaining={MAXIMUM} total={MAXIMUM} heightInRem={2} />
      <p>4</p>
      <RateLimit remaining={MAXIMUM} total={MAXIMUM} heightInRem={4} />
    </div>
  ));

const onAccessTokenSubmit = accessToken => action(`access token submitted: ${accessToken}`);

storiesOf('AccessTokenForm', module)
  .add('default', () => <AccessTokenForm />)
  .add('with height', () => (
    <div>
      <p>1rem</p>
      <AccessTokenForm heightInRem={1} />
      <p>2rem</p>
      <AccessTokenForm heightInRem={2} />
      <p>4rem</p>
      <AccessTokenForm heightInRem={4} />
    </div>
  ))
  .add('with onSubmit handler', () => (
    <AccessTokenForm heightInRem={2} onSubmit={onAccessTokenSubmit} />
  ))
  .add('with accessToken', () => (
    <AccessTokenForm heightInRem={2} accessToken="accessToken" onSubmit={onAccessTokenSubmit} />
  ));
