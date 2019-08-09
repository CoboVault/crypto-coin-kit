"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var keyProvider_1 = require("./keyProvider");
var XRP_1 = require("./XRP");
var NEO_1 = __importDefault(require("./NEO"));
exports.default = {
    coins: {
        XRP: XRP_1.XRP,
        NEO: NEO_1.default
    },
    KeyProvider: keyProvider_1.KeyProvider
};
