import autobind from 'autobind-decorator';
import PropTypes from 'prop-types';
import React from 'react';
import { Flex, Box } from 'reflexbox';
import styled from 'styled-components';

import { Colors } from '../../services/colors';
import { rem } from '../../services/scale';

const SField = styled.input`
  border: 1px solid ${props => (props.invalid ? Colors.RED : Colors.WHITE)};
  color: ${props => (props.invalid ? Colors.RED : Colors.DARK_GRAY)};
  padding: ${rem(14)};
  width: calc(100% - 1px * 2 - 14px * 2);
`;

const SFieldAddon = styled.div`
  background-color: ${Colors.WHITE};
  padding: ${rem(6)};
`;

const SForm = styled(Flex) `
  margin: 0 0 ${rem(8)};
`;

const SSaveButton = styled.input`
  background-color: ${Colors.DARK_GRAY};
  border: 0;
  border-radius: ${rem(2)};
  color: ${Colors.WHITE};
  height: calc(${rem(48)} - ${rem(6)} * 2);
  margin: 0 auto;
  text-transform: uppercase;
  width: 100%;

  &:disabled {
    background-color: ${Colors.GRAY};
  }
`;

export default class AccessTokenForm extends React.Component {
  static defaultProps = {
    accessToken: '',
    loading: false,
    limit: -1,
  };

  static propTypes = {
    accessToken: PropTypes.string,
    limit: PropTypes.number,
    loading: PropTypes.bool,
    updateAccessToken: PropTypes.func.isRequired,
    submitAccessTokenAsync: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = { saving: false };
  }

  @autobind
  handleSubmit(e) {
    const { submitAccessTokenAsync } = this.props;
    e.preventDefault();
    this.setState({ saving: true });
    return submitAccessTokenAsync().then(() => {
      this.setState({ saving: false });
    });
  }

  render() {
    const { accessToken, limit, loading, updateAccessToken } = this.props;
    const { saving } = this.state;
    return (
      <form onSubmit={this.handleSubmit}>
        <SForm>
          <Box w={4 / 5}>
            <SField
              invalid={limit === 0}
              type="text"
              value={accessToken}
              onChange={e => updateAccessToken(e.target.value)}
            />
          </Box>
          <Box w={1 / 5}>
            <SFieldAddon>
              <SSaveButton
                disabled={loading}
                innerRef={(el) => { this.saveButton = el; }}
                type="submit"
                value={saving ? 'Saved!' : 'Save'}
              />
            </SFieldAddon>
          </Box>
        </SForm>
      </form>
    );
  }
}
