import numeral from 'numeral';
import PropTypes from 'prop-types';
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
  animation: .75s ease 0s 1 normal forwards running ${props => filling(props)};
  height: 100%;
`;

const SRateLimit = styled.div`
  margin: 0 0 ${rem(24)};
`;

const SNumber = styled(Box) `
  color: ${props => (props.invalid ? COLORS.RED : COLORS.WHITE)};
  font-size: ${rem(24)};
`;

const RateLimit = ({ remaining, limit }) => {
  const percentage = limit !== 0 ? (remaining / limit) * 100 : limit;
  const number = limit !== 0 ? numeral(remaining).format('0,0') : 'N/A';
  return (
    <SRateLimit>
      <SProgressBar.Container>
        <Box w={4 / 5}>
          <SProgressBar>
            <SProgressBar.Fill percentage={percentage} />
          </SProgressBar>
        </Box>
        <SNumber
          flex
          align="center"
          invalid={limit === 0}
          justify="center"
          w={1 / 5}
        >{number}</SNumber>
      </SProgressBar.Container>
      <SHelp>{'For requests using Basic Authentication or OAuth (including access token), you can make up to 5,000 requests per hour.'}</SHelp>
    </SRateLimit>
  );
};

RateLimit.propTypes = {
  remaining: PropTypes.number,
  limit: PropTypes.number,
};

RateLimit.defaultProps = {
  remaining: 0,
  limit: 0,
};

export default RateLimit;
