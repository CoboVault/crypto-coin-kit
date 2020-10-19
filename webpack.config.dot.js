/**
 * @file webpack build for j2v8 call this lib, Multi entry for each coin and utils
 */
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const WebpackGitHash = require('webpack-git-hash');


module.exports = {
  entry: {
    DOT: './src/DOT/index.ts',
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.dot.json',
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    alias: {
      bip39: path.resolve(__dirname, './moduleHooks/bip39.js'),
      '@polkadot/wasm-crypto/crypto-polyfill': path.resolve(
        __dirname,
        './moduleHooks/crypto-polyfill',
      ),
      '@polkadot/wasm-crypto': path.resolve(
        __dirname,
        './moduleHooks/wasm-crypto.js',
      ),
    },
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
