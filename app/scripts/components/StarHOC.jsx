import React from 'react';
import PropTypes from 'prop-types';

import { Client } from 'chomex';

import Star from './Star';

class StarHOC extends React.Component {
  static propTypes = {
    owner: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.messageClient = new Client(chrome.runtime);
  }

  state = { count: 0, hasError: false, loading: true };

  async updateCountAsync() {
    const { owner, name } = this.props;
    const { data: count } = await this.messageClient.message('/stars/get', { owner, name });
    this.setState({ count, loading: false });
  }

  render() {
    const { count, loading } = this.state;
    return <Star count={count} loading={loading} />;
  }
}

export default StarHOC;
