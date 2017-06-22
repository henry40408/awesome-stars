import moment from 'moment';

exports.TextColor = {
  BLUE: '#c4f7ff',
  GREEN: '#d4fc45',
  ORANGE: '#ffa631',
  RED: '#ff3e00',
  WHITE: '#ffffff',
  YELLOW: '#f9ef14',
};

exports.ERROR = '@@ERROR';

exports.log = function log(...args) {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log.apply(null, [`[${moment().format()}]`, ...args]);
  }
};
