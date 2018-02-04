import React from 'react';
import { storiesOf } from '@storybook/react';

import ProgressBar from '../scripts/components/ProgressBar';

const MAXIMUM = 5000;

storiesOf('ProgressBar', module)
  .add('default', () => <ProgressBar />)
  .add('empty', () => <ProgressBar remaining={0} total={MAXIMUM} />)
  .add('less than 50%', () => <ProgressBar remaining={MAXIMUM * 0.499} total={MAXIMUM} />)
  .add('less than 2%', () => <ProgressBar remaining={MAXIMUM * 0.019} total={MAXIMUM} />)
  .add('full', () => <ProgressBar remaining={MAXIMUM} total={MAXIMUM} />)
  .add('with 4rem height', () => <ProgressBar remaining={MAXIMUM} total={MAXIMUM} height="4rem" />);
