/* eslint-disable global-require */

import React from 'react'
import PropTypes from 'prop-types'

import styled from 'styled-components'

import colors from '../themes/colors'

let blueStar
let orangeStar
let whiteStar
let yellowStar

if (chrome && chrome.extension && chrome.extension.getURL) {
  blueStar = chrome.extension.getURL('images/star-blue.svg')
  orangeStar = chrome.extension.getURL('images/star-orange.svg')
  whiteStar = chrome.extension.getURL('images/star-white.svg')
  yellowStar = chrome.extension.getURL('images/star-yellow.svg')
} else {
  blueStar = require('../../images/star-blue.svg')
  orangeStar = require('../../images/star-orange.svg')
  whiteStar = require('../../images/star-white.svg')
  yellowStar = require('../../images/star-yellow.svg')
}

let starIcons = {
  [colors.blue]: blueStar,
  [colors.orange]: orangeStar,
  [colors.white]: whiteStar,
  [colors.yellow]: yellowStar
}

let StarBadge = styled.span`
  background-color: ${colors.gray};
  border-radius: 0.75rem;
  font-size: 0.75rem;
  margin: 0 0 0 0.25rem;
  padding: 0.25rem 0.5rem;
`

let StarIcon = styled.img`
  background-color: transparent !important;
  margin: 0 0.25rem 0 0;
`

let StarText = styled.span`
  color: ${({ color }) => color};
`

class Star extends React.Component {
  static propTypes = {
    count: PropTypes.number,
    hasError: PropTypes.bool,
    loading: PropTypes.bool
  }

  static defaultProps = {
    count: 0,
    hasError: false,
    loading: false
  }

  colorsFromCount = (count) => {
    switch (true) {
      case count >= 10000:
        return { star: colors.orange, text: colors.orange }
      case count < 10000 && count >= 5000:
        return { star: colors.yellow, text: colors.yellow }
      case count < 5000 && count >= 1000:
        return { star: colors.white, text: colors.white }
      default:
        return { star: colors.blue, text: colors.lightBlue }
    }
  }

  renderAlt = (starColor) => {
    let { hasError } = this.props
    if (hasError) {
      return 'something went wrong'
    }
    return `${starColor} star`
  }

  renderText = () => {
    let formatter = new Intl.NumberFormat('en-US')
    let { count, hasError, loading } = this.props
    if (loading) {
      return '...'
    }
    if (hasError) {
      return '\u26A0'
    }
    return formatter.format(count)
  }

  render () {
    let { count } = this.props
    let { star: starColor, text: textColor } = this.colorsFromCount(count)
    return (
      <StarBadge>
        <StarIcon src={starIcons[starColor]} alt={this.renderAlt(starColor)} />
        <StarText color={textColor}>{this.renderText()}</StarText>
      </StarBadge>
    )
  }
}

export default Star
