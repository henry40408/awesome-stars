import React from 'react';
import { Flex, Box } from 'reflexbox';
import styled from 'styled-components';

import COLORS from '../../services/colors';
import { rem } from '../../services/scale';

const SField = styled.input`
  border: 1px solid ${COLORS.WHITE};
  padding: ${rem(14)};
  width: calc(100% - 1px * 2 - 14px * 2);
`;

const SFieldAddon = styled.div`
  background-color: ${COLORS.WHITE};
  padding: ${rem(6)};
`;

const SForm = styled(Flex) `
  margin: 0 0 ${rem(8)};
`;

const SSaveButton = styled.input`
  background-color: ${COLORS.DARK_GRAY};
  border: 0;
  border-radius: ${rem(2)};
  color: ${COLORS.WHITE};
  height: calc(${rem(48)} - ${rem(6)} * 2);
  margin: 0 auto;
  text-transform: uppercase;
  width: 100%;
`;

const AccessTokenForm = () => (
  <form>
    <SForm>
      <Box w={4 / 5}>
        <SField type="text" />
      </Box>
      <Box w={1 / 5}>
        <SFieldAddon>
          <SSaveButton type="submit" value="Save" />
        </SFieldAddon>
      </Box>
    </SForm>
  </form>
);

export default AccessTokenForm;
