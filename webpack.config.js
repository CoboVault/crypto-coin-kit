/**
 * @file webpack build for j2v8 call this lib, Multi entry for each coin and utils
 */
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const WebpackGitHash = require('webpack-git-hash');


module.exports = {
  entry: {
    BTC: './src/BTC/index.ts',
    DCR: './src/DCR/index.ts',
    ETC: './src/ETC/index.ts',
    ETH: './src/ETH/index.ts',
    XRP: './src/XRP/index.ts',
    XZC: './src/XZC/index.ts',
    BCH: './src/BCH/index.ts',
    DASH: './src/DASH/index.ts',
    LTC: './src/LTC/index.ts',
    IOST: './src/IOST/index.ts',
    TRON: './src/TRON/index.ts',
    TCFX: './src/TCFX/index.ts',
    CFX: './src/CFX/index.ts',
    utils: './src/utils/index.ts',
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ['ts-loader'],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].bundle_[githash].js',
    libraryTarget: 'umd',
    // library: ['cryptoCoinKit', '[name]'],
    path: path.resolve(__dirname, 'packed/subBundle'),
  },
  plugins: [
    new WebpackGitHash()
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: true,
        cache: true,
        parallel: true,
        sourceMap: false, // Must be set to true if using source-maps in production
        terserOptions: {
          // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
          extractComments: 'all',
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
  },
};
