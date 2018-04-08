import { Router } from 'chomex';

import { version } from '../../../package.json';
import DIConstants from '../constants';

class MessageRouter {
  constructor(ctx) {
    /** @type {AccessTokenRepository} */
    this.accessToken = ctx[DIConstants.R_ACCESS_TOKEN];

    /** @type {GithubService} */
    this.github = ctx[DIConstants.S_GITHUB];

    /** @type {ChromeStorageService} */
    this.storage = ctx[DIConstants.S_CHROME_STORAGE];

    this.log = ctx[DIConstants.LOG];

    this.messageRouter = new Router();

    chrome.runtime.onInstalled.addListener(async (reason, previousVersion) => {
      const isUpdate = reason === 'update' && previousVersion !== version;

      if (process.env.NODE_ENV === 'development') {
        chrome.runtime.openOptionsPage();
      }

      // reset update notification state...
      // 1. in development environment
      // 2. when extension is successfully upgraded
      if (process.env.NODE_ENV === 'development' || isUpdate) {
        return this.storage.saveAsync(this.storage.KEY_UPDATE_NOTIFICATION_SENT, false);
      }

      return true;
    });

    chrome.browserAction.onClicked.addListener(() => {
      const { runtime } = chrome;

      if (runtime.openOptionsPage) {
        // New way to open options pages, if supported (Chrome 42+).
        return runtime.openOptionsPage();
      }

      // Reasonable fallback.
      return window.open(runtime.getURL('pages/options.html'));
    });

    this.registerAll();

    this.github.fetchRateLimitAsync();
  }

  register(route, fn) {
    return this.messageRouter.on(route, async (message) => {
      this.log(route, 'called with', message);
      return fn(message);
    });
  }

  registerAll() {
    this.register('/access-token/get', async () => this.accessToken.loadAsync());

    this.register('/access-token/set', async (message) => {
      const { accessToken: token } = message;
      return this.accessToken.saveAsync(token);
    });

    this.register('/awesome-list/check', async (message) => {
      const { owner, name } = message;
      return this.github.isAwesomeListAsync({ owner, name });
    });

    this.register('/rate-limit', async () => this.github.fetchRateLimitAsync());

    this.register('/stars/get', async (message) => {
      const { owner, name, shouldUpdateRateLimit } = message;

      if (owner && name) {
        return this.github.fetchStarCountAsync(owner, name, { shouldUpdateRateLimit });
      }

      return -1;
    });

    this.register('/update-notification-sent/get', async () =>
      this.storage.loadAsync(this.storage.KEY_UPDATE_NOTIFICATION_SENT),
    );

    this.register('/update-notification-sent/set', async (message) => {
      const { updateNotificationSent } = message;
      return this.storage.saveAsync(
        this.storage.KEY_UPDATE_NOTIFICATION_SENT,
        updateNotificationSent,
      );
    });

    this.register('/apply-on-github-issues/get', async () =>
      this.storage.loadAsync(this.storage.KEY_APPLY_ON_GITHUB_ISSUES, false),
    );

    this.register('/apply-on-github-issues/set', async (message) => {
      const { applyOnGithubIssues } = message;
      return this.storage.saveAsync(
        this.storage.KEY_APPLY_ON_GITHUB_ISSUES,
        applyOnGithubIssues,
      );
    });
  }

  start() {
    chrome.runtime.onMessage.addListener(this.messageRouter.listener());
  }
}

export default MessageRouter;
