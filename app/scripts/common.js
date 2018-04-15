import format from 'date-fns/format';

import colors from './themes/colors';

export function log(...args) {
  if (process.env.NODE_ENV === 'development') {
    const timestamp = format(new Date(), 'YYYY-MM-DDTHH:mm:ssZ');
    // eslint-disable-next-line no-console
    console.log.apply(null, [`[${timestamp}]`, ...args]);
  }
}

export function updateBadge(maybeText) {
  const color = maybeText === null ? colors.red : colors.blue;
  const text = maybeText === null ? 'N/A' : maybeText;

  log('badge updated:', { color, text });

  chrome.browserAction.setBadgeBackgroundColor({ color });
  chrome.browserAction.setBadgeText({ text });
}
