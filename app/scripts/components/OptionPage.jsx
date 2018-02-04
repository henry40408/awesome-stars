import React from 'react';
import styled from 'styled-components';
import { Box, Flex } from 'reflexbox';

import { description, version } from '../../../package.json';
import colors from '../themes/colors';

const Container = styled(Flex)`
  font-family: 'Roboto', sans-serif;
  font-weight: lighter;
  width: 60rem;
`;

const Header = styled(Box)`
  font-family: 'Roboto Slab', sans-serif;
  letter-spacing: 0.0625rem;
  text-align: center;
  & > h1 {
    font-size: 2rem;
  }
  & > h2 {
    font-size: 1rem;
  }
`;

const Body = styled(Box)`
  h3 {
    font-family: 'Roboto Slab', sans-serif;
  }
`;

const Footer = styled(Box)`
  font-family: 'Roboto Slab', sans-serif;
  text-align: center;
  line-height: 1.5;
`;

const ColorList = styled.ul`
  list-style: none;
  padding: 0;
  & > li::before {
    content: '-';
    margin: 0 1rem 0 0;
  }
  & > li {
    line-height: 1.618;
  }
`;

const ColorItem = styled.li`
  color: ${({ color }) => color || colors.white};
`;

const StarsCurve = styled.img`
  margin: -8rem 0 0;
`;

const OptionPage = () => (
  <Container column>
    <Header>
      <img src="../../images/options-logo.png" alt="Awesome Stars logo" />
      <h1>Awesome Stars</h1>
      <h2>{description}</h2>
    </Header>
    <Body>
      <Flex>
        <Box w={1 / 2}>
          <h3>How Hot are Those Stars?</h3>
          <p>
            There are four levels for the stars of repository. Awesome Stars changes its color
            according to star count:
          </p>
          <ColorList>
            <ColorItem color={colors.lightBlue}>Blue for less than 1,000.</ColorItem>
            <ColorItem color={colors.white}>White for 1,000 to 4,999.</ColorItem>
            <ColorItem color={colors.yellow}>Yellow for 5,000 to 9,999.</ColorItem>
            <ColorItem color={colors.orange}>Orange for more than 10,000.</ColorItem>
          </ColorList>
          <StarsCurve src="../../images/stars-curve.svg" alt="Stars Curve" />
        </Box>
        <Box w={1 / 2}>
          <h3>Setup Access Token</h3>
          <h3>Additional Options</h3>
          <h3>Rate Limit</h3>
        </Box>
      </Flex>
    </Body>
    <Footer>
      {new Date().getFullYear()} All rights reserved. Made by Henry Wu with &#x2764;.<br />
      {`Version ${version}`}
    </Footer>
  </Container>
);

export default OptionPage;
