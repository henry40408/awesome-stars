import React from 'react';
import styled from 'styled-components';

import COLORS from '../../services/colors';
import { rem } from '../../services/scale';

const SColorList = styled.ul`
  padding: 0;
`;

SColorList.Item = styled.li`
  color: ${props => props.color};
  list-style: none;

  &:before {
    content: '- ';
  }
`;

const SStarCurve = styled.img`
  margin: ${rem(-162)} 0 0;
`;

const LeftPanel = () => (
  <div>
    <h2>{'How Hot are those Stars'}</h2>
    <div>{'There are four levels for the stars of repository. Awesome Stars changes its color according to star count:'}</div>
    <SColorList>
      <SColorList.Item color={COLORS.BLUE}>{'Blue for less than 1,000.'}</SColorList.Item>
      <SColorList.Item color={COLORS.WHITE}>{'White for 1,000 to 4,999.'}</SColorList.Item>
      <SColorList.Item color={COLORS.YELLOW}>{'Yellow for 5,000 to 9,999.'}</SColorList.Item>
      <SColorList.Item color={COLORS.ORANGE}>{'Orange for more than 10,000.'}</SColorList.Item>
    </SColorList>
    <SStarCurve src={'../../../images/stars-curve.svg'} alt="Stars Curve" />
  </div>
);

export default LeftPanel;
