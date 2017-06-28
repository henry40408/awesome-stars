import React from 'react';
import { Flex, Box } from 'reflexbox';
import styled from 'styled-components';

import { version } from '../../../../package.json';
import { rem } from '../../services/scale';

import { Header } from '../common';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';

const SBody = styled(Flex) `
  margin: 0 0 4vh;
`;

const SFooter = styled.div`
  font-family: Roboto, sans-serif;
  font-size: ${rem(12)};
  font-weight: 300;
  margin: 0 0 8vh;
  text-align: center;
`;

const SPage = styled(Flex) `
  margin: 0 auto;
  width: ${rem(960)};
`;

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <SFooter>
      <div>{`${year} All rights reserved. Made by Henry Wu with \u2764.`}</div>
      <div>{`Version ${version}`}</div>
    </SFooter>
  );
};

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
