"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
var ripple_address_codec_1 = require("ripple-address-codec");
// @ts-ignore
var ripple_keypairs_1 = require("ripple-keypairs");
var Common_1 = __importDefault(require("../Common"));
var transaction_1 = require("./transaction");
var XRP = /** @class */ (function () {
    function XRP() {
        this.generateAddress = function (publicKey) {
            return ripple_keypairs_1.deriveAddress(publicKey);
        };
        this.isAddressValid = function (address) {
            return ripple_address_codec_1.isValidAddress(address);
        };
        this.generateUnsignedTransaction = function (args) {
            var transactionBuilder = new transaction_1.TransactionBuilder(args);
            return transactionBuilder.toBinary();
        };
        this.sign = function (rawTx, signProvider) {
            return Common_1.default.sign(rawTx, signProvider);
        };
    }
    return XRP;
}());
exports.XRP = XRP;
