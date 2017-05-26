// Enable chromereload by uncommenting this line:
// eslint-disable-next-line import/no-extraneous-dependencies
import 'chromereload/devonly';

// chrome.browserAction.setBadgeText({ text: '\'Allo' });

chrome.browserAction.onClicked.addListener(() => {
  if (chrome.runtime.openOptionsPage) { // New way to open options pages, if supported (Chrome 42+).
    return chrome.runtime.openOptionsPage();
  }

  return window.open(chrome.runtime.getURL('options.html')); // Reasonable fallback.
});
