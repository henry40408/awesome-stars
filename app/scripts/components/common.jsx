import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

import { version } from '../../../package.json';
import { Colors } from '../services/colors';
import { rem } from '../services/scale';

const SFooter = styled.div`
  font-family: Roboto, sans-serif;
  font-size: ${rem(12)};
  font-weight: 300;
  margin: 0 0 2vh;
  text-align: center;
`;

const SHeader = styled.div`
  margin: 4vh 0;
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
  margin: 0 0 ${rem(12)};
  text-transform: uppercase;
`;

export const SText = styled.div`
  line-height: 1.5;
  ${props => props.alert && `color: ${Colors.RED};`}
`;

export const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <SFooter>
      <SText>{`${year} All rights reserved. Made by Henry Wu with \u2764.`}</SText>
      <SText>{`Version ${version}`}</SText>
    </SFooter>
  );
};

export const Header = () => (
  <SHeader>
    <SLogo src={'../../../images/options-logo.png'} alt="Awesome Stars Logo" />
    <SPageTitle>{'Awesome Stars'}</SPageTitle>
    <SPageSubtitle>{'Awesome Stars is a chrome extension that shows you stars of repository on awesome list.'}</SPageSubtitle>
  </SHeader>
);

export const Link = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
);

Link.propTypes = {
  children: PropTypes.node,
  href: PropTypes.string,
};

Link.defaultProps = {
  children: null,
  href: null,
};
