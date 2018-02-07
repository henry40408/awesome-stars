const path = require('path');

module.exports = (storybookBaseConfig, configType) => {
  storybookBaseConfig.module.rules.push({
    test: /\.svg$/,
    loader: require.resolve('file-loader'),
  });

  storybookBaseConfig.resolve.extensions.push('.svg');

  return storybookBaseConfig;
};
