import React from 'react';
import { Flex, Box } from 'reflexbox';
import styled from 'styled-components';

import { version } from '../../../../package.json';
import { rem } from '../../services/scale';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';

const SBody = styled(Flex) `
  margin: 0 0 ${rem(32)};
`;

const SFooter = styled.div`
  font-family: Roboto, sans-serif;
  font-size: ${rem(12)};
  font-weight: 300;
  text-align: center;
`;

const SHeader = styled.div`
  margin: ${rem(48)} 0 ${rem(32)};
  text-align: center;
`;

const SLogo = styled.img`
  height: ${rem(70)};
  margin: 0 0 ${rem(10)};
  width: ${rem(72)};
`;

const SPage = styled(Flex) `
  margin: 0 auto;
  width: 60rem;
`;

const SPageSubtitle = styled.div`
  font-family: Roboto, sans-serif;
  font-weight: 300;
`;

const SPageTitle = styled.h1`
  font-family: 'Roboto Slab', sans-serif;
  font-size: ${rem(32)};
  letter-spacing: ${rem(3.9)};
  margin: 0 0 ${rem(12)};
  text-transform: uppercase;
`;

const Header = () => (
  <SHeader>
    <SLogo src={'../../../images/options-logo.png'} alt="Awesome Stars Logo" />
    <SPageTitle>{'Awesome Stars'}</SPageTitle>
    <SPageSubtitle>{'Awesome Stars is a chrome extension that shows you stars of repository on awesome list.'}</SPageSubtitle>
  </SHeader>
);

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
