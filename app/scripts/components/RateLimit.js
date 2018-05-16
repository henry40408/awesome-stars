import React from 'react'
import PropTypes from 'prop-types'

import { Flex, reflex } from 'reflexbox'
import styled, { keyframes } from 'styled-components'

import colors from '../themes/colors'

let RLFillColor = ({ percentage }) => {
  if (percentage >= 50) {
    return colors.green
  } else if (percentage > 2 && percentage < 50) {
    return colors.yellow
  }
  return colors.red
}

let RLFilling = ({ percentage }) => keyframes`
  from {
    background-color: ${colors.red};
    width: 0%;
  }

  to {
    background-color: ${RLFillColor({ percentage })};
    width: ${percentage}%;
  }
`

let BaseRLMeterContainer = styled.div`
  border: 1px white solid;
  height: ${({ heightInRem }) => heightInRem}rem;
`

let RLMeterContainer = reflex(BaseRLMeterContainer)

let BaseRLMeter = styled.div`
  animation: 1.618s ease 0s 1 normal forwards running
    ${({ percentage }) => RLFilling({ percentage })};
  height: 100%;
  width: ${({ percentage }) => percentage}%;
`

let RLMeter = reflex(BaseRLMeter)

let BaseRLNumber = styled.div`
  color: ${({ inverse }) => (inverse ? colors.white : colors.darkGray)};
  font-size: ${({ heightInRem }) => heightInRem * (heightInRem > 1 ? 0.5 : 0.9)}rem;
  display: flex;
  align-items: center;
  justify-content: center;
`

let RLNumber = reflex(BaseRLNumber)

let RateLimit = ({ heightInRem, inverse, remaining, total }) => {
  let formatter = new Intl.NumberFormat('en-US')

  let ratio = total === 0 ? 0 : remaining / total
  let formatted

  if (remaining === -1 || total === -1) {
    ratio = 0
    formatted = 'N/A'
  } else {
    formatted = formatter.format(remaining)
  }

  return (
    <Flex>
      <RLMeterContainer w={3 / 4} heightInRem={heightInRem}>
        <RLMeter inverse={inverse} percentage={ratio * 100} />
      </RLMeterContainer>
      <RLNumber w={1 / 4} heightInRem={heightInRem} inverse={inverse}>
        {formatted}
      </RLNumber>
    </Flex>
  )
}

RateLimit.propTypes = {
  heightInRem: PropTypes.number,
  inverse: PropTypes.bool,
  remaining: PropTypes.number,
  total: PropTypes.number
}

RateLimit.defaultProps = {
  heightInRem: 1,
  inverse: false,
  remaining: 0,
  total: 0
}

module.exports = RateLimit
