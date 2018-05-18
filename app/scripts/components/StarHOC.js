import React from 'react'
import PropTypes from 'prop-types'

import Star from './Star'

class StarHOC extends React.Component {
  static propTypes = {
    owner: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }

  state = { count: 0, hasError: false, loading: true }

  get tuple () {
    return {
      owner: this.props.owner,
      name: this.props.name
    }
  }

  updateCount = count => {
    this.setState({ count, loading: false })
  }

  updateError = hasError => {
    this.setState({ hasError, loading: false })
  }

  render () {
    let { count, hasError, loading } = this.state
    return <Star count={count} hasError={hasError} loading={loading} />
  }
}

export default StarHOC
