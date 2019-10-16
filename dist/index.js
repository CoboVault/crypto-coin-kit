"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var DCR_1 = require("./DCR");
var ETH_1 = require("./ETH");
var keyProvider_1 = __importDefault(require("./keyProvider"));
var NEO_1 = __importDefault(require("./NEO"));
var utils = __importStar(require("./utils"));
var XRP_1 = require("./XRP");
var XZC_1 = require("./XZC");
exports.default = {
    coins: {
        XRP: XRP_1.XRP,
        NEO: NEO_1.default,
        XZC: XZC_1.XZC,
        DCR: DCR_1.DCR,
        ETH: ETH_1.ETH
    },
    KeyProvider: keyProvider_1.default,
    utils: utils
};
