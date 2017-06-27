import styled from 'styled-components';

import { rem } from '../services/scale';

export const SHeader = styled.h2`
  font-size: ${rem(24)};
  font-weight: 300;
  margin: 0 0 ${rem(18)};
  text-transform: uppercase;
`;

export const SText = styled.div`
  line-height: 1.5;
`;
