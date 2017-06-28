# CHANGELOG

## 2.1.0

- Rewrite almost everything with React and the performance is satisified.
- Replace `THANK_YOU.md` with fancier Thank You page.

## 2.0.2

- Add [`THANK_YOU`](THANK_YOU.md) file and automatically open it after user installs or upgrades the extension.

## 2.0.1

- Unify application description to `Awesome Stars is a chrome extension that shows you stars of repository on awesome list.`

## 2.0

- Most importantly, use `chrome.local` instead of `chrome.sync` to store access token, so **if you upgrade from 1.x, I strongly suggest you regenerate the access token for this extension**.
- Check whether repository is listed on [awesome](https://awesome.re/) repository.
- Staring repositories in different colors is built-in now.
- Redesign UI, thanks to [@sandokaishy](https://github.com/sandokaishy).
- Recreate the project with [generator-chrome-extension-kickstart](https://github.com/HaNdTriX/generator-chrome-extension-kickstart) for Webpack 2 and Babel 6.
