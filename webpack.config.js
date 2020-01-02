/**
 * @file webpack build for j2v8 call this lib, Multi entry for each coin and utils
 */
const path = require('path');

module.exports = {
  entry: {
    BTC: './src/BTC/index.ts',
    DCR: './src/DCR/index.ts',
    ETC: './src/ETC/index.ts',
    ETH: './src/ETH/index.ts',
    NEO: './src/NEO/index.ts',
    XRP: './src/XRP/index.ts',
    XZC: './src/XZC/index.ts',
    BCH: './src/BCH/index.ts',
    DASH:'./src/DASH/index.ts',
    utils: './src/utils/index.ts',
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: '[name].bundle.js',
    libraryTarget: 'umd',
    // library: ['cryptoCoinKit', '[name]'],
    path: path.resolve(__dirname, 'dist/subBundle')
  }
};
