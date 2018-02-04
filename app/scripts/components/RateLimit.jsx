import React from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';
import styled, { keyframes } from 'styled-components';
import { Flex, reflex } from 'reflexbox';

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

const BaseRLMeterContainer = styled.div`
  border: 1px transparent solid;
  height: ${({ heightInRem }) => heightInRem}rem;
`;

const RLMeterContainer = reflex(BaseRLMeterContainer);

const BaseRLMeter = styled.div`
  animation: 1.618s ease 0s 1 normal forwards running
    ${({ percentage }) => RLFilling({ percentage })};
  height: 100%;
  width: ${({ percentage }) => percentage}%;
`;

const RLMeter = reflex(BaseRLMeter);

const BaseRLNumber = styled.div`
  color: ${({ inverse }) => (inverse ? colors.white : colors.darkGray)};
  font-size: ${({ heightInRem }) => heightInRem * 0.9}rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RLNumber = reflex(BaseRLNumber);

const RateLimit = ({ heightInRem, inverse, remaining, total }) => {
  const ratio = total === 0 ? 0 : remaining / total;
  return (
    <Flex>
      <RLMeterContainer w={2 / 3} heightInRem={heightInRem}>
        <RLMeter inverse={inverse} percentage={ratio * 100} />
      </RLMeterContainer>
      <RLNumber w={1 / 3} heightInRem={heightInRem} inverse={inverse}>
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
