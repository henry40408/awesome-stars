import React from 'react';
import styled from 'styled-components';

import { rem } from '../services/scale';

const SHeader = styled.div`
  margin: 6vh 0;
  text-align: center;
`;

const SLogo = styled.img`
  height: ${rem(70)};
  margin: 0 0 ${rem(10)};
  width: ${rem(72)};
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

export const SSectionHeader = styled.h2`
  font-size: ${rem(24)};
  font-weight: 300;
  margin: 0 0 ${rem(18)};
  text-transform: uppercase;
`;

export const SText = styled.div`
  line-height: 1.5;
`;

export const Header = () => (
  <SHeader>
    <SLogo src={'../../../images/options-logo.png'} alt="Awesome Stars Logo" />
    <SPageTitle>{'Awesome Stars'}</SPageTitle>
    <SPageSubtitle>{'Awesome Stars is a chrome extension that shows you stars of repository on awesome list.'}</SPageSubtitle>
  </SHeader>
);
