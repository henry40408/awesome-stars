import React from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';
import styled, { keyframes } from 'styled-components';
import { Flex, Box, reflex } from 'reflexbox';

import colors from '../themes/colors';

const RLFillColor = ({ percentage }) => {
  if (percentage >= 50) {
    return colors.green;
  } else if (percentage > 2 && percentage < 50) {
    return colors.yellow;
  }
  return colors.red;
};

const RLFilling = ({ percentage }) => keyframes`
  from {
    background-color: ${colors.red};
    width: 0%;
  }

  to {
    background-color: ${RLFillColor({ percentage })};
    width: ${percentage}%;
  }
`;

const BaseRLMeterContainer = styled(Box)`
  border: 1px transparent solid;
  height: ${({ heightInRem }) => heightInRem}rem;
`;

const RLMeterContainer = reflex(BaseRLMeterContainer);

const RLMeter = styled(Box)`
  animation: 1.618s ease 0s 1 normal forwards running
    ${({ percentage }) => RLFilling({ percentage })};
  height: 100%;
  width: ${({ percentage }) => percentage}%;
`;

const RLNumber = styled(Box)`
  color: ${({ inverse }) => (inverse ? colors.white : colors.darkGray)};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RateLimit = ({ heightInRem, inverse, remaining, total }) => {
  const ratio = total === 0 ? 0 : remaining / total;
  return (
    <Flex>
      <RLMeterContainer heightInRem={heightInRem} w={2 / 3}>
        <RLMeter inverse={inverse} percentage={ratio * 100} />
      </RLMeterContainer>
      <RLNumber inverse={inverse} w={1 / 3}>
        {numeral(remaining).format('0,0')}
      </RLNumber>
    </Flex>
  );
};

RateLimit.propTypes = {
  heightInRem: PropTypes.number,
  inverse: PropTypes.bool,
  remaining: PropTypes.number,
  total: PropTypes.number,
};

RateLimit.defaultProps = {
  heightInRem: 1,
  inverse: false,
  remaining: 0,
  total: 0,
};

module.exports = RateLimit;
