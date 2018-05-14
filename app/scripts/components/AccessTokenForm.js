import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Box, Flex, reflex } from 'reflexbox'

import colors from '../themes/colors'

let ATFContainer = styled(Flex)`
  border: 1px solid ${colors.darkGray};
`

let ATFField = styled.input`
  border: 2px ${({ invalid }) => (invalid ? colors.red : 'transparent')} solid;
  box-sizing: border-box;
  font-size: ${({ heightInRem }) => heightInRem * 1.1}rem;
  padding: ${({ heightInRem }) => heightInRem * 0.5}rem;
  width: 100%;
`

let BaseATFButtonContainer = styled.div`
  background: ${colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ heightInRem }) => heightInRem * 0.25}rem;
`

let ATFButtonContainer = reflex(BaseATFButtonContainer)

let ATFButton = styled.button`
  box-sizing: border-box;
  background-color: ${({ disabled }) => (disabled ? colors.lightGray : colors.darkGray)};
  border: 1px solid ${({ disabled }) => (disabled ? colors.lightGray : colors.darkGray)};
  color: ${colors.white};
  font-size: ${props => props.heightInRem}rem;
  height: 100%;
  padding: 0.25rem;
  text-transform: uppercase;
  width: 100%;
`

class AccessTokenForm extends React.Component {
  state = { accessToken: '' }

  componentWillReceiveProps ({ accessToken }) {
    this.setState({ accessToken })
  }

  updateAccessToken = (accessToken) => {
    this.setState({ accessToken })
  }

  render () {
    let { heightInRem, invalid, saving, onSubmit } = this.props
    let { accessToken } = this.state
    return (
      <ATFContainer>
        <Box w={3 / 4}>
          <ATFField
            type='text'
            value={accessToken}
            onChange={e => this.updateAccessToken(e.target.value)}
            heightInRem={heightInRem}
            invalid={invalid}
          />
        </Box>
        <ATFButtonContainer w={1 / 4} heightInRem={heightInRem}>
          <ATFButton
            disabled={saving}
            onClick={() => onSubmit(accessToken)}
            heightInRem={heightInRem}
          >Save</ATFButton>
        </ATFButtonContainer>
      </ATFContainer>
    )
  }
}

AccessTokenForm.propTypes = {
  accessToken: PropTypes.string,
  heightInRem: PropTypes.number,
  invalid: PropTypes.bool,
  onSubmit: PropTypes.func,
  saving: PropTypes.bool
}

AccessTokenForm.defaultProps = {
  accessToken: '',
  heightInRem: 1,
  invalid: false,
  onSubmit: () => {},
  saving: false
}

export default AccessTokenForm
