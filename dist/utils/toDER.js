"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ts-ignore
// @ts-ignore
var secp256k1_1 = __importDefault(require("secp256k1"));
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
exports.fromSignResultToDER = function (result) {
    var r = Buffer.from(result.r, "hex");
    var s = Buffer.from(result.s, "hex");
    var signature = Buffer.concat([r, s]);
    return secp256k1_1.default.signatureExport(signature).toString("hex");
};
