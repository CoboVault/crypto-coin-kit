"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var keyProvider_1 = __importDefault(require("./keyProvider"));
var NEO_1 = __importDefault(require("./NEO"));
var XRP_1 = require("./XRP");
var XZC_1 = require("./XZC");
exports.default = {
    coins: {
        XRP: XRP_1.XRP,
        NEO: NEO_1.default,
        XZC: XZC_1.XZC
    },
    KeyProvider: keyProvider_1.default
};
