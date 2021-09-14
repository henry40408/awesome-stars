const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const isProd = "production" === process.env.NODE_ENV;

const plugins = [
  new CopyPlugin({
    patterns: [
      { from: "./src/manifest.json", to: "manifest.json" },
      { from: "./src/options.html", to: "options.html" },
      { from: "./src/icons", to: "icons" },
    ],
  }),
];
if (isProd) {
  plugins = [...plugins, new BundleAnalyzerPlugin()];
}

module.exports = {
  entry: {
    options: "./src/options.tsx",
  },
  devtool: "source-map",
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins,
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
};
