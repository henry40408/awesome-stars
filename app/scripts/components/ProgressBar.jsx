import React from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';
import styled, { keyframes } from 'styled-components';
import { Flex, Box } from 'reflexbox';

import colors from '../themes/colors';

const PBFillerColor = ({ percentage }) => {
  if (percentage >= 50) {
    return colors.green;
  } else if (percentage > 2 && percentage < 50) {
    return colors.yellow;
  }
  return colors.red;
};

const PBFilling = ({ percentage }) => keyframes`
  from {
    background-color: ${colors.red};
    width: 0%;
  }

  to {
    background-color: ${PBFillerColor({ percentage })};
    width: ${percentage}%;
  }
`;

const PBProgressContainer = styled(Box)`
  border: 1px ${({ inverse }) => (inverse ? colors.white : colors.darkGray)} solid;
  height: ${props => props.height};
`;

const PBProgress = styled(Box)`
  animation: 1.618s ease 0s 1 normal forwards running
    ${({ percentage }) => PBFilling({ percentage })};
  height: 100%;
  width: ${({ percentage }) => percentage}%;
`;

const PBNumber = styled(Box)`
  color: ${({ inverse }) => (inverse ? colors.white : colors.darkGray)};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProgressBar = ({ height, inverse, remaining, total }) => {
  const percentage = total === 0 ? 0 : remaining / total * 100;
  return (
    <Flex>
      <PBProgressContainer height={height} w={2 / 3}>
        <PBProgress inverse={inverse} percentage={percentage} />
      </PBProgressContainer>
      <PBNumber inverse={inverse} w={1 / 3}>
        {numeral(remaining).format('0,0')}
      </PBNumber>
    </Flex>
  );
};

ProgressBar.propTypes = {
  height: PropTypes.string,
  inverse: PropTypes.bool,
  remaining: PropTypes.number,
  total: PropTypes.number,
};

ProgressBar.defaultProps = {
  height: '1rem',
  inverse: false,
  remaining: 0,
  total: 0,
};

module.exports = ProgressBar;
