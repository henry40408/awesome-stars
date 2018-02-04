import React from 'react';
import styled from 'styled-components';
import { Box, Flex } from 'reflexbox';

import { description, version } from '../../../package.json';
import colors from '../themes/colors';

import AccessTokenForm from '../components/AccessTokenForm';
import RateLimit from '../components/RateLimit';

const Container = styled(Flex)`
  font-family: 'Roboto', sans-serif;
  font-weight: lighter;
  text-align: justify;
  max-width: 960px;
`;

const Header = styled(Box)`
  font-family: 'Roboto Slab', sans-serif;
  letter-spacing: 0.0625rem;
  text-align: center;
  & > h1 {
    font-size: 2rem;
    letter-spacing: 0.1rem;
    text-transform: uppercase;
  }
  & > h2 {
    font-size: 1rem;
  }
`;

const Body = styled(Box)`
  margin: 0 0 1rem;
  h3,
  h4 {
    font-family: 'Roboto Slab', sans-serif;
    margin: 0.75rem 0;
  }
  p {
    line-height: 1.5;
    margin: 0.5rem 0;
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
  margin: -5.75rem 0 0;
`;

const AlertText = styled.span`
  color: ${colors.red};
`;

const OptionPage = () => (
  <Container column>
    <Header p={2}>
      <img src="../../images/options-logo.png" alt="Awesome Stars logo" />
      <h1>Awesome Stars</h1>
      <h2>{description}</h2>
    </Header>
    <Body>
      <Flex wrap w={1}>
        <Box w={[58 / 60, 26 / 60, 28 / 60]} p={2}>
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
          <StarsCurve src="../../images/stars-curve.svg" alt="Stars Curve" width="100%" />
        </Box>
        <Box w={[58 / 60, 26 / 60, 28 / 60]} p={2}>
          <h3>Setup Access Token</h3>
          <AccessTokenForm />
          <p>
            <a href="https://github.com/settings/tokens/new?description=Awesome%20Stars">
              Get an access token
            </a>{' '}
            from <a href="https://github.com/settings">GitHub settings page</a>
            <br />
            <AlertText>Please DO NOT select any scopes!</AlertText>
          </p>
          <h3>Additional Options</h3>
          <h3>Rate Limit</h3>
          <RateLimit inverse remaining={5000} total={5000} heightInRem={2.5} />
          <p>
            <small>
              For requests using Basic Authentication or OAuth (including access token), you can
              make up to 5,000 requests per hour.
            </small>
          </p>
          <h4>Why do You Need an Access Token?</h4>
          <p>
            <small>
              According to{' '}
              <a href="https://developer.github.com/v3/#rate-limiting">GitHub documentation</a>. For
              unauthenticated requests, the rate limit allows you to make up to 60 requests per
              hour. Unauthenticated requests are associated with your IP address, and not the user
              making requests. Awesome Stars can only works properly with an access token.
            </small>
          </p>
        </Box>
      </Flex>
    </Body>
    <Footer p={2}>
      <small>
        {new Date().getFullYear()} All rights reserved. Made by Henry Wu with &#x2764;.<br />
        {`Version ${version}`}
      </small>
    </Footer>
  </Container>
);

export default OptionPage;
