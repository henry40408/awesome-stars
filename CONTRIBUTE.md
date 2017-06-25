# Awesome Stars

Awesome Stars is a chrome extension that shows you stars of repository on awesome list.

## Dependencies

Install gulp CLI

```shell
$ npm install gulp --global
```

Install dependencies

```shell
$ npm install
```

## Usage

Run `$ gulp --watch` and load the `dist`-directory into chrome.

## Entry-files (bundles)

There are two kinds of entry-files that create bundles.

1. All js-files in the root of the `./app/scripts` directory
2. All css-,scss- and less-files in the root of the `./app/styles` directory

## Tasks

### Build

```
$ gulp
```

Option | Description
---|---
`--watch` | Starts a livereload server and watches all assets. <br>To reload the extension on change include `livereload.js` in your bundle.
`--production` | Minifies all assets
`--verbose` | Log additional data to the console.
`--vendor` | Compile the extension for different vendors (chrome, firefox, opera)  Default: chrome
`--sourcemaps` | Force the creation of sourcemaps. Default: !production

### Development

```
$ gulp --watch --vendor=chrome
```

### Pack

Zips your `dist` directory and saves it in the `packages` directory.

```
$ gulp pack --vendor=chrome
```

### Version

Increments version number of `manifest.json` and `package.json`,
commits the change to git and adds a git tag.

```
$ gulp patch   // => 0.0.X
```

or

```shell
$ gulp feature // => 0.X.0
```

or

```shell
$ gulp release // => X.0.0
```


## Globals

The build tool also defines a variable named `process.env.NODE_ENV` in your scripts. It will be set to `development` unless you use the `--production` option.

**Example:** `./app/background.js`

```javascript
if(process.env.NODE_ENV === 'development'){
  console.log('We are in development mode!');
}
```
