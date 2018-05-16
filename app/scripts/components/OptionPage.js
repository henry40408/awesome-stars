import React from 'react'

import { Client } from 'chomex'
import { Box, Flex } from 'reflexbox'
import styled from 'styled-components'

import { version } from '../../../package.json'
import colors from '../themes/colors'

import AccessTokenForm from '../components/AccessTokenForm'
import RateLimit from '../components/RateLimit'

let Container = styled(Flex)`
  font-family: 'Roboto', Helvetica, sans-serif;
  font-weight: light;
  max-width: 960px;
`

let Header = styled(Box)`
  font-family: 'Roboto Slab', sans-serif;
  letter-spacing: 0.0625rem;
  text-align: center;
  & > h1 {
    font-size: 2rem;
    letter-spacing: 0.1rem;
    text-transform: uppercase;
  }
  & > h2 {
    font-size: 1rem;
  }
`

let Main = styled(Box)`
  margin: 0 0 1rem;
  h3,
  h4 {
    font-family: 'Roboto Slab', sans-serif;
    margin: 0.75rem 0;
  }
  p {
    line-height: 1.5;
    margin: 0.5rem 0;
  }
`

let Footer = styled(Box)`
  font-family: 'Roboto Slab', sans-serif;
  text-align: center;
  line-height: 1.5;
`

let ColorList = styled.ul`
  list-style: none;
  padding: 0;
  & > li::before {
    content: '-';
    margin: 0 1rem 0 0;
  }
  & > li {
    line-height: 1.618;
  }
`

let ColorItem = styled.li`
  color: ${({ color }) => color || colors.white};
`

let StarsCurve = styled.img`
  margin: -7.5rem 0 0;
`

let AlertText = styled.span`
  color: ${colors.red};
`

let CapitalizedH3 = styled.h3`
  text-transform: capitalize;
`

function capitalize (str) {
  return str.replace(/\b\w/, l => l.toUpperCase())
}

class OptionPage extends React.Component {
  constructor (props) {
    super(props)
    this.client = new Client(chrome.runtime)
  }

  state = {
    accessToken: '',
    invalid: false,
    limit: 0,
    remaining: 0,
    saving: false
  }

  componentDidMount () {
    this.loadInitialDataAsync()
  }

  getMessage = (messageName, subsitutions = []) => (
    chrome.i18n.getMessage(messageName, subsitutions)
  )

  loadAccessTokenAsync = async () => {
    let { data: accessToken } = await this.client.message('/access-token/get')
    return { accessToken }
  }

  loadInitialDataAsync = async () => {
    this.setState({ saving: true })
    let { accessToken } = await this.loadAccessTokenAsync()
    let { invalid, limit, remaining } = await this.loadRateLimitAsync()
    this.setState({ accessToken, invalid, limit, remaining, saving: false })
  }

  loadRateLimitAsync = async () => {
    let { data: { remaining, limit } } = await this.client.message('/rate-limit')
    let invalid = remaining === -1 || limit === -1
    return { invalid, limit, remaining }
  }

  saveAccessTokenAsync = async (accessToken) => {
    this.setState({ saving: true, accessToken })
    await this.client.message('/access-token/set', { accessToken })
    let { invalid, limit, remaining } = await this.loadRateLimitAsync()
    this.setState({ saving: false, invalid, limit, remaining })
  }

  renderLeftPane = () => (
    <Box w={[58 / 60, 26 / 60, 28 / 60]} p={2}>
      <h3>{this.getMessage('opHowHotAreThoseStars')}</h3>
      <p>{this.getMessage('opHowHotAreThoseStarsDescription')}</p>
      <ColorList>
        <ColorItem color={colors.lightBlue}>{
          this.getMessage('colorForLess', [
            capitalize(this.getMessage('blue')),
            '1,000'
          ])
        }</ColorItem>
        <ColorItem color={colors.white}>{
          this.getMessage('colorForRange', [
            capitalize(this.getMessage('white')),
            '1,000',
            '4,999'
          ])
        }</ColorItem>
        <ColorItem color={colors.yellow}>{
          this.getMessage('colorForRange', [
            capitalize(this.getMessage('yellow')),
            '5,000',
            '9,999'
          ])
        }</ColorItem>
        <ColorItem color={colors.orange}>{
          this.getMessage('colorForMore', [
            capitalize(this.getMessage('orange')),
            '10,000'
          ])
        }</ColorItem>
      </ColorList>
      <StarsCurve src='../../images/stars-curve.svg' alt='Stars Curve' width='100%' />
    </Box>
  )

  renderRightPane = () => {
    let { accessToken, invalid, remaining, limit, saving } = this.state
    return (
      <Box w={[58 / 60, 26 / 60, 28 / 60]} p={2}>
        <CapitalizedH3>{this.getMessage('setupAccessToken')}</CapitalizedH3>
        <AccessTokenForm
          accessToken={accessToken}
          invalid={invalid}
          onSubmit={this.saveAccessTokenAsync}
          saving={saving}
        />
        <p>
          {this.getMessage('ifYouDontHaveOneYet')}
          <a href='https://github.com/settings/tokens/new?description=Awesome%20Stars'>
            {this.getMessage('getAnAccessToken')}
          </a>
          <br />
          <AlertText>{this.getMessage('pleaseDoNotSelectAnyScopes')}</AlertText>
        </p>
        <h3>{this.getMessage('rateLimit')}</h3>
        <RateLimit inverse remaining={remaining} total={limit} heightInRem={2.5} />
        <p>
          <small>{this.getMessage('rateLimitDescription')}</small>
        </p>
        <h4>{this.getMessage('whyDoYouNeedAnAccessToken')}</h4>
        <p>
          <small>
            {this.getMessage('whyDoYouNeedAnAccessTokenDescription1')}
            <a href='https://developer.github.com/v3/#rate-limiting'>
              {this.getMessage('githubDocumentation')}
            </a>
            {this.getMessage('whyDoYouNeedAnAccessTokenDescription2')}
          </small>
        </p>
      </Box>
    )
  }

  render () {
    return (
      <Container column>
        <Header p={2}>
          <img src='../../images/options-logo.png' alt='Awesome Stars logo' />
          <h1>{this.getMessage('appName')}</h1>
          <h2>{this.getMessage('appDescription')}</h2>
        </Header>
        <Main>
          <Flex wrap w={1}>
            {this.renderLeftPane()}
            {this.renderRightPane()}
          </Flex>
        </Main>
        <Footer p={2}>
          <small>
            {new Date().getFullYear()} All rights reserved. Made by Henry Wu with &#x2764;.<br />
            {`Version ${version}`}
          </small>
        </Footer>
      </Container>
    )
  }
}

export default OptionPage
