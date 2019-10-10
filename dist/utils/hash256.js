"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = require("crypto");
// @ts-ignore
var crypto_browserify_1 = __importDefault(require("crypto-browserify"));
exports.sha256 = function (data) {
    return crypto_1.createHash("sha256")
        .update(data)
        .digest();
};
exports.blake256 = function (data) {
    return crypto_browserify_1.default
        .createHash("blake256")
        .update(data)
        .digest();
};
exports.default = (function (data) {
    return exports.sha256(exports.sha256(data));
});
exports.doubleBlake256 = function (data) {
    return exports.blake256(exports.blake256(data));
};
