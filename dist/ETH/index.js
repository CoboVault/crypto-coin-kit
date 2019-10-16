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
var ethereumjs_tx_1 = require("ethereumjs-tx");
var ethereumjs_util_1 = require("ethereumjs-util");
var safe_buffer_1 = require("safe-buffer");
var numberToHex_1 = __importDefault(require("../utils/numberToHex"));
var ETH = /** @class */ (function () {
    function ETH(chainId) {
        var _this = this;
        this.generateTransactionSync = function (data, signer) {
            var tx = new ethereumjs_tx_1.Transaction(data);
            var hash = tx.hash(false);
            var sig = signer.sign(hash.toString("hex"));
            var signedTx = _this.buildSignedTx(tx, sig);
            return _this.extractSignedResult(signedTx);
        };
        this.generateTransaction = function (data, signer) { return __awaiter(_this, void 0, void 0, function () {
            var tx, hash, sig, signedTx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tx = new ethereumjs_tx_1.Transaction(data);
                        hash = tx.hash(false);
                        return [4 /*yield*/, signer.sign(hash.toString("hex"))];
                    case 1:
                        sig = _a.sent();
                        signedTx = this.buildSignedTx(tx, sig);
                        return [2 /*return*/, this.extractSignedResult(signedTx)];
                }
            });
        }); };
        this.signMessageSync = function (message, signer) {
            var hash = ethereumjs_util_1.hashPersonalMessage(safe_buffer_1.Buffer.from(message, "utf8"));
            var sig = signer.sign(hash.toString("hex"));
            return _this.buildSignedMessage(sig);
        };
        this.signMessage = function (message, signer) { return __awaiter(_this, void 0, void 0, function () {
            var hash, sig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        hash = ethereumjs_util_1.hashPersonalMessage(safe_buffer_1.Buffer.from(message, "utf8"));
                        return [4 /*yield*/, signer.sign(hash.toString("hex"))];
                    case 1:
                        sig = _a.sent();
                        return [2 /*return*/, this.buildSignedMessage(sig)];
                }
            });
        }); };
        this.generateAddress = function (publicKey) {
            var address = ethereumjs_util_1.pubToAddress(ethereumjs_util_1.toBuffer(publicKey), true).toString("hex");
            return ethereumjs_util_1.toChecksumAddress(address);
        };
        this.isAddressValid = function (address, checkSum) {
            if (checkSum) {
                return ethereumjs_util_1.isValidAddress(address) && ethereumjs_util_1.toChecksumAddress(address) === address;
            }
            return ethereumjs_util_1.isValidAddress(address);
        };
        this.buildSignedTx = function (tx, sigResult) {
            var r = safe_buffer_1.Buffer.from(sigResult.r, "hex");
            var s = safe_buffer_1.Buffer.from(sigResult.s, "hex");
            var v = 27 + sigResult.recId;
            if (_this.chainId > 0) {
                v += _this.chainId * 2 + 8;
            }
            var sig = { r: r, s: s, v: safe_buffer_1.Buffer.alloc(1, v) };
            return Object.assign(tx, sig);
        };
        this.extractSignedResult = function (tx) {
            return {
                txId: ethereumjs_util_1.addHexPrefix(tx.hash().toString("hex")),
                txHex: ethereumjs_util_1.addHexPrefix(tx.serialize().toString("hex"))
            };
        };
        this.buildSignedMessage = function (sigResult) {
            var r = sigResult.r;
            var s = sigResult.s;
            var recIdStr = numberToHex_1.default(sigResult.recId);
            return ethereumjs_util_1.addHexPrefix(r.concat(s).concat(recIdStr));
        };
        this.chainId = chainId || 1;
    }
    return ETH;
}());
exports.ETH = ETH;
