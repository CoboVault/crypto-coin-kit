const lodash = require('lodash');
const { encode, decode } = require('conflux-address-js');

/**
 * Encode address buffer to new CIP37 address
 *
 * @param addressBuffer {buffer}
 * @param netId {number}
 * @param verbose {boolean}
 * @return {string}
 *
 * @example
 */
function encodeCfxAddress(addressBuffer, netId, verbose = false) {
  return encode(addressBuffer, netId, verbose);
}

/**
 * Decode CIP37 address to hex40 address with type, netId info
 *
 * @param address {string}
 * @return {Object}
 *
 * @example
 */
function decodeCfxAddress(address) {
  return decode(address);
}

/**
 * Check whether a given address is valid, will return a boolean value
 *
 * @param address {string}
 * @return {boolean}
 *
 * @example
 */
function isValidCfxAddress(address) {
  if (!lodash.isString(address)) {
    return false;
  }
  try {
    decodeCfxAddress(address.toLowerCase());
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Check conflux address's prefix
 *
 * @param address {string}
 * @return {boolean}
 *
 * @example
 */
function hasNetworkPrefix(address) {
  if (!lodash.isString(address)) {
    return false;
  }
  address = address.toLowerCase();
  const parts = address.split(':');
  if (parts.length !== 2 && parts.length !== 3) {
    return false;
  }
  const prefix = parts[0];
  if (prefix === 'cfx' || prefix === 'cfxtest') {
    return true;
  }
  return prefix.startsWith('net') && /^([1-9]\d*)$/.test(prefix.slice(3));
}

module.exports = {
  encodeCfxAddress,
  isValidCfxAddress,
  hasNetworkPrefix,
};
