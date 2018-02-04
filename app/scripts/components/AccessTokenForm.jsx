import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Flex, Box } from 'reflexbox';

import colors from '../themes/colors';

const ATFContainer = styled(Flex)`
  border: 1px solid ${colors.darkGray};
`;

const ATFField = styled.input`
  border: none;
  box-sizing: border-box;
  font-size: ${({ heightInRem }) => heightInRem * 1.05}rem;
  padding: ${({ heightInRem }) => heightInRem * 0.5}rem;
  width: 100%;
`;

const ATFButtonContainer = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ heightInRem }) => heightInRem * 0.25}rem;
`;

const ATFButton = styled.button`
  box-sizing: border-box;
  background-color: ${colors.darkGray};
  border: 1px solid ${colors.darkGray};
  color: ${colors.white};
  font-size: ${props => props.heightInRem}rem;
  height: 100%;
  padding: 0.25rem;
  text-transform: uppercase;
  width: 100%;
`;

const AccessTokenForm = ({ heightInRem }) => (
  <ATFContainer>
    <Box w={2 / 3}>
      <ATFField type="text" heightInRem={heightInRem} />
    </Box>
    <ATFButtonContainer w={1 / 3} heightInRem={heightInRem}>
      <ATFButton heightInRem={heightInRem}>Save</ATFButton>
    </ATFButtonContainer>
  </ATFContainer>
);

AccessTokenForm.propTypes = {
  heightInRem: PropTypes.string,
};

AccessTokenForm.defaultProps = {
  heightInRem: 1,
};

export default AccessTokenForm;
