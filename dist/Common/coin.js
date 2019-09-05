"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Common_1 = __importDefault(require("../Common"));
var Coin = /** @class */ (function () {
    function Coin() {
    }
    Coin.prototype.sign = function (rawTx, signProvider) {
        return Common_1.default.sign(rawTx, signProvider);
    };
    return Coin;
}());
exports.default = Coin;
