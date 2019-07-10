"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
var ripple_address_codec_1 = require("ripple-address-codec");
// @ts-ignore
var ripple_keypairs_1 = require("ripple-keypairs");
exports.derive = function (publicKey) {
    return ripple_keypairs_1.deriveAddress(publicKey);
};
exports.isValid = function (address) {
    return ripple_address_codec_1.isValidAddress(address);
};
