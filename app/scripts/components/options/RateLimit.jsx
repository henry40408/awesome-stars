import React from 'react';
import { Box, Flex } from 'reflexbox';
import styled, { keyframes } from 'styled-components';

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

SProgressBar.Container = styled(Flex) `
  margin: 0 0 ${rem(8)};
`;

const colorFromPercentage = (percentage) => {
  if (percentage >= 50) {
    return COLORS.GREEN;
  } else if (percentage > 2 && percentage < 50) {
    return COLORS.YELLOW;
  }
  return COLORS.RED;
};

const filling = props => keyframes`
  from {
    background-color: ${COLORS.RED};
    width: 0%;
  }

  to {
    background-color: ${colorFromPercentage(props.percentage)};
    width: ${props.percentage}%;
  }
`;

SProgressBar.Fill = styled.div`
  animation: 1.5s ease 1s 1 normal forwards running ${props => filling(props)};
  height: 100%;
`;

const SRateLimit = styled.div`
  margin: 0 0 ${rem(24)};
`;

const SNumber = styled(Box) `
  font-size: ${rem(24)};
`;

const RateLimit = () => (
  <SRateLimit>
    <SProgressBar.Container>
      <Box w={4 / 5}>
        <SProgressBar>
          <SProgressBar.Fill percentage={0} />
        </SProgressBar>
      </Box>
      <SNumber flex w={1 / 5} align="center" justify="center">{'N/A'}</SNumber>
    </SProgressBar.Container>
    <SHelp>{'For requests using Basic Authentication or OAuth (including access token), you can make up to 5,000 requests per hour.'}</SHelp>
  </SRateLimit>
);

export default RateLimit;
