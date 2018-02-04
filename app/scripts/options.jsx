import React from 'react';
import ReactDOM from 'react-dom';
import { injectGlobal } from 'styled-components';

import colors from './themes/colors';
import OptionPage from './components/OptionPage';

// eslint-disable-next-line no-unused-expressions
injectGlobal`
html,
body {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 16px;
}

body {
  background-image: url('../images/options-background.svg');
  color: ${colors.white};
}

a {
  color: ${colors.orange};
}

#container {
  align-items: center;
  display: flex;
  height: 100vh;
  justify-content: center;
  width: 100vw;
}
`;

ReactDOM.render(<OptionPage />, document.getElementById('container'));
