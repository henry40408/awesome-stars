import React from 'react'
import PropTypes from 'prop-types'

import Star from './Star'

class StarHOC extends React.Component {
  static propTypes = {
    owner: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }

  state = { count: 0, loading: true }

  getTuple () {
    return {
      owner: this.props.owner,
      name: this.props.name
    }
  }

  updateCount = count => {
    this.setState({ count, loading: false })
  }

  render () {
    let { count, loading } = this.state
    return <Star count={count} loading={loading} />
  }
}

export default StarHOC
