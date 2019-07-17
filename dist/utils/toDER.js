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
    return "30440220" + r + "0220" + s;
});
