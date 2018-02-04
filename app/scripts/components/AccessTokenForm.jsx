import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Flex, reflex } from 'reflexbox';
import { withState } from 'recompose';

import colors from '../themes/colors';

const ATFContainer = styled(Flex)`
  border: 1px solid ${colors.darkGray};
`;

const ATFField = styled.input`
  border: none;
  box-sizing: border-box;
  font-size: ${({ heightInRem }) => heightInRem * 1.1}rem;
  padding: ${({ heightInRem }) => heightInRem * 0.5}rem;
  width: 100%;
`;

const BaseATFButtonContainer = styled.div`
  background: ${colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ heightInRem }) => heightInRem * 0.25}rem;
`;

const ATFButtonContainer = reflex(BaseATFButtonContainer);

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

const AccessTokenForm = withState('token', 'setToken', ({ accessToken }) => accessToken)(
  ({ heightInRem, onSubmit, setToken, token }) => (
    <ATFContainer>
      <Box w={2 / 3}>
        <ATFField
          type="text"
          value={token}
          onChange={e => setToken(e.target.value)}
          heightInRem={heightInRem}
        />
      </Box>
      <ATFButtonContainer w={1 / 3} heightInRem={heightInRem}>
        <ATFButton heightInRem={heightInRem} onClick={onSubmit(token)}>
          Save
        </ATFButton>
      </ATFButtonContainer>
    </ATFContainer>
  ),
);

AccessTokenForm.propTypes = {
  accessToken: PropTypes.string,
  heightInRem: PropTypes.number,
  onSubmit: PropTypes.func,
};

AccessTokenForm.defaultProps = {
  accessToken: '',
  heightInRem: 1,
  onSubmit: () => {},
};

export default AccessTokenForm;
