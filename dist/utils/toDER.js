"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (function (input) {
    if (input.length < 128) {
        throw new Error("not a valid signature");
    }
    var INPUT = input.toUpperCase();
    var r = INPUT.slice(0, 64);
    var s = INPUT.slice(64, 128);
    // DER https://github.com/bitcoin/bips/blob/master/bip-0066.mediawiki
    var signatureType = "30"; // compound
    var signatureLength = "44"; // 68 bytes = 0220(2) + r (32) + 0220(2) + s (32)
    var rsPrefix = "0220"; // 02 + 20 (R/S - length = 32 bytes)
    return "" + signatureType + signatureLength + rsPrefix + r + rsPrefix + s;
});
