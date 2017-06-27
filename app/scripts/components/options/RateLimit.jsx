import React from 'react';
import { Box, Flex } from 'reflexbox';
import styled from 'styled-components';

import { SText } from '../common';
import COLORS from '../../services/colors';
import { rem } from '../../services/scale';

const SHelp = SText.extend`
  font-size: ${rem(12)};
`;

const SProgressBar = styled.div`
  border: 1px solid ${COLORS.WHITE};
  height: ${rem(48)};
`;

const SProgressBarContainer = styled(Flex) `
  margin: 0 0 ${rem(8)};
`;

const SRateLimit = styled.div`
  margin: 0 0 ${rem(24)};
`;

const SNumber = styled(Box) `
  font-size: ${rem(24)};
`;

const RateLimit = () => (
  <SRateLimit>
    <SProgressBarContainer>
      <Box w={4 / 5}><SProgressBar /></Box>
      <SNumber flex w={1 / 5} align="center" justify="center">{'N/A'}</SNumber>
    </SProgressBarContainer>
    <SHelp>{'For requests using Basic Authentication or OAuth (including access token), you can make up to 5,000 requests per hour.'}</SHelp>
  </SRateLimit>
);

export default RateLimit;
