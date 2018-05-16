import gulp from 'gulp'
import gulpif from 'gulp-if'
import { log, colors } from 'gulp-util'
import named from 'vinyl-named'
import webpack from 'webpack'
import gulpWebpack from 'webpack-stream'
import plumber from 'gulp-plumber'
import livereload from 'gulp-livereload'
import args from './lib/args'
import * as webpackBundleAnalyzer from 'webpack-bundle-analyzer'
import LodashModuleReplacementPlugin from 'lodash-webpack-plugin'
import UglifyJsPlugin from 'uglifyjs-webpack-plugin'

const ENV = args.production ? 'production' : 'development'

gulp.task('scripts', (cb) => {
  return gulp.src('app/scripts/*.js')
    .pipe(plumber({
      // Webpack will log the errors
      errorHandler () {}
    }))
    .pipe(named())
    .pipe(gulpWebpack({
        mode: 'none',
        devtool: args.sourcemaps ? 'inline-source-map' : false,
        watch: args.watch,
        plugins: (
          args.production ? [
            new UglifyJsPlugin(),
            new LodashModuleReplacementPlugin()
          ] : [
            new webpack.NamedModulesPlugin()
          ]
        ).concat([
          new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(ENV),
            'process.env.VENDOR': JSON.stringify(args.vendor)
          })
        ], args.production ? [
          new webpack.optimize.ModuleConcatenationPlugin(),
          new webpack.NoEmitOnErrorsPlugin(),
          new webpackBundleAnalyzer.BundleAnalyzerPlugin({ analyzerMode: 'static' })
        ] : []),
        module: {
          rules: [{
            test: /\.js$/,
            loader: 'eslint-loader',
            exclude: /node_modules/,
            enforce: 'pre'
          }, {
            test: /\.js$/,
            loader: 'babel-loader'
          }, {
            test: /\.svg$/,
            loader: 'file-loader'
          }]
        }
      },
      webpack,
      (err, stats) => {
        if (err) return
        log(`Finished '${colors.cyan('scripts')}'`, stats.toString({
          chunks: false,
          colors: true,
          cached: false,
          children: false
        }))
      }))
    .pipe(gulp.dest(`dist/${args.vendor}/scripts`))
    .pipe(gulpif(args.watch, livereload()))
})