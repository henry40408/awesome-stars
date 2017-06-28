import React from 'react';
import { Flex, Box } from 'reflexbox';
import styled from 'styled-components';

import { rem } from '../../services/scale';

import { Footer, Header } from '../common';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';

const SBody = styled(Flex) `
  margin: 0 0 4vh;
`;

const SPage = styled(Flex) `
  margin: 0 auto;
  width: ${rem(960)};
`;

const OptionPage = () => (
  <SPage column>
    <Box><Header /></Box>
    <SBody>
      <Box w={1 / 2}><LeftPanel /></Box>
      <Box w={1 / 2}><RightPanel /></Box>
    </SBody>
    <Box><Footer /></Box>
  </SPage>
);

export default OptionPage;
