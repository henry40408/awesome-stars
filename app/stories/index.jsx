import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import AccessTokenForm from '../scripts/components/AccessTokenForm';
import ProgressBar from '../scripts/components/ProgressBar';

const MAXIMUM = 5000;

storiesOf('ProgressBar', module)
  .add('default', () => <ProgressBar />)
  .add('empty', () => <ProgressBar remaining={0} total={MAXIMUM} />)
  .add('less than 50%', () => <ProgressBar remaining={MAXIMUM * 0.499} total={MAXIMUM} />)
  .add('less than 2%', () => <ProgressBar remaining={MAXIMUM * 0.019} total={MAXIMUM} />)
  .add('full', () => <ProgressBar remaining={MAXIMUM} total={MAXIMUM} />)
  .add('with 4rem height', () => <ProgressBar remaining={MAXIMUM} total={MAXIMUM} height="4rem" />);

const onAccessTokenSubmit = accessToken => action(`access token submitted: ${accessToken}`);

storiesOf('AccessTokenForm', module)
  .add('default', () => <AccessTokenForm />)
  .add('with 2rem height', () => <AccessTokenForm heightInRem={2} />)
  .add('with onSubmit handler', () => (
    <AccessTokenForm heightInRem={2} onSubmit={onAccessTokenSubmit} />
  ))
  .add('with accessToken', () => (
    <AccessTokenForm heightInRem={2} accessToken="accessToken" onSubmit={onAccessTokenSubmit} />
  ));
