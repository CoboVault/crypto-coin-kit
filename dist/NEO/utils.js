"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var neon_core_1 = require("@cityofzion/neon-core");
var enc_hex_1 = __importDefault(require("crypto-js/enc-hex"));
var sha256_1 = __importDefault(require("crypto-js/sha256"));
var elliptic_1 = require("elliptic");
var curve = new elliptic_1.ec("p256");
function signHex(hex, privateKey) {
    var msgHash = sha256_1.default(enc_hex_1.default.parse(hex)).toString();
    var msgHashHex = Buffer.from(msgHash, "hex");
    var privateKeyBuffer = Buffer.from(privateKey, "hex");
    var sig = curve.sign(msgHashHex, privateKeyBuffer);
    return {
        r: sig.r.toString("hex", 32),
        s: sig.s.toString("hex", 32)
    };
}
exports.SignProviderWithPrivateKey = function (privateKey) {
    return {
        sign: function (hex) { return __awaiter(void 0, void 0, void 0, function () {
            var _a, r, s;
            return __generator(this, function (_b) {
                _a = signHex(hex, privateKey), r = _a.r, s = _a.s;
                return [2 /*return*/, {
                        r: r,
                        s: s,
                        recId: 0
                    }];
            });
        }); }
    };
};
exports.SignProviderWithPrivateKeySync = function (privateKey) {
    return {
        sign: function (hex) {
            var _a = signHex(hex, privateKey), r = _a.r, s = _a.s;
            return {
                r: r,
                s: s,
                recId: 0
            };
        }
    };
};
exports.buildNeoBalance = function (externalNeoBalance) {
    var address = externalNeoBalance.address;
    var net = externalNeoBalance.net;
    var assetSymbols = [];
    var assets = {};
    var tokenSymbols = [];
    var tokens = {};
    var isAsset = function (amount, unspent) {
        if (amount === 0 && unspent.length === 0) {
            return true;
        }
        if (amount !== 0 && unspent.length === 0) {
            return false;
        }
        if (amount !== 0 && unspent.length !== 0) {
            return true;
        }
        return true;
    };
    externalNeoBalance.balance.forEach(function (each) {
        if (isAsset(each.amount, each.unspent)) {
            tokenSymbols.push(each.asset_symbol);
            assets[each.asset_symbol] = {
                balance: each.amount,
                unspent: each.unspent.map(function (eachUnspent) { return ({
                    value: eachUnspent.value,
                    txid: eachUnspent.txid,
                    index: eachUnspent.n
                }); })
            };
        }
        else {
            tokenSymbols.push(each.asset_symbol);
            tokens[each.asset_symbol] = each.amount;
        }
    });
    return new neon_core_1.wallet.Balance({
        address: address,
        net: net,
        assetSymbols: assetSymbols,
        assets: assets,
        tokens: tokens,
        tokenSymbols: tokenSymbols
    });
};
exports.buildNeoClaims = function (address, net, externalClaims) {
    var claims = externalClaims.map(function (each) { return ({
        claim: each.unclaimed,
        txid: each.txid,
        index: each.n,
        value: each.value,
        start: each.start_height,
        end: each.end_height
    }); });
    return new neon_core_1.wallet.Claims({
        address: address,
        net: net,
        claims: claims
    });
};
