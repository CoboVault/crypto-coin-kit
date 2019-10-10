"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
// @ts-ignore
var hash_js_1 = __importDefault(require("hash.js"));
// @ts-ignore
var ripple_address_codec_1 = require("ripple-address-codec");
// @ts-ignore
var ripple_binary_codec_1 = __importDefault(require("ripple-binary-codec"));
// @ts-ignore
var ripple_hashes_1 = require("ripple-hashes");
// @ts-ignore
var ripple_keypairs_1 = require("ripple-keypairs");
var utils_1 = require("../utils");
var XRP = /** @class */ (function () {
    function XRP() {
        var _this = this;
        this.generateAddress = function (publicKey) {
            return ripple_keypairs_1.deriveAddress(publicKey);
        };
        this.isAddressValid = function (address) {
            return ripple_address_codec_1.isValidAddress(address);
        };
        this.generateTransaction = function (txData, keyProvider, options) { return __awaiter(_this, void 0, void 0, function () {
            var _a, unsignedTx, txJson, signature;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.generateUnsignedTx(txData, keyProvider.publicKey), unsignedTx = _a.unsignedTx, txJson = _a.txJson;
                        return [4 /*yield*/, keyProvider.sign(unsignedTx)];
                    case 1:
                        signature = _b.sent();
                        return [2 /*return*/, this.getSignedTx(txJson, signature)];
                }
            });
        }); };
        this.generateTransactionSync = function (txData, keyProvider, options) {
            var _a = _this.generateUnsignedTx(txData, keyProvider.publicKey), unsignedTx = _a.unsignedTx, txJson = _a.txJson;
            var signature = keyProvider.sign(unsignedTx);
            return _this.getSignedTx(txJson, signature);
        };
        this.signMessage = function (message, signProvider) { return __awaiter(_this, void 0, void 0, function () {
            var hashHex, _a, r, s;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        hashHex = this.getSignMessageHex(message);
                        return [4 /*yield*/, signProvider.sign(hashHex)];
                    case 1:
                        _a = _b.sent(), r = _a.r, s = _a.s;
                        return [2 /*return*/, "" + r + s];
                }
            });
        }); };
        this.signMessageSync = function (message, signProvider) {
            var hashHex = _this.getSignMessageHex(message);
            var _a = signProvider.sign(hashHex), r = _a.r, s = _a.s;
            return "" + r + s;
        };
        this.generateUnsignedTx = function (txData, signingPubKey) {
            var amount = txData.amount, changeAddress = txData.changeAddress, fee = txData.fee, sequence = txData.sequence, tag = txData.tag, to = txData.to;
            var partialTx = {
                Account: changeAddress,
                Amount: amount.toString(),
                Destination: to,
                Fee: fee.toString(),
                Flags: 2147483648,
                Sequence: sequence,
                TransactionType: "Payment",
                SigningPubKey: signingPubKey
            };
            var txWithDestinationTag = tag
                ? __assign(__assign({}, partialTx), { DestinationTag: tag }) : partialTx;
            var txHex = Buffer.from(ripple_binary_codec_1.default.encodeForSigning(txWithDestinationTag), "hex");
            var unsignedTx = Buffer.from(hash_js_1.default
                .sha512()
                .update(txHex)
                .digest()
                .slice(0, 32)).toString("hex");
            return {
                unsignedTx: unsignedTx,
                txJson: txWithDestinationTag
            };
        };
        this.getSignedTx = function (txJson, signature) {
            var signedTx = __assign(__assign({}, txJson), { TxnSignature: utils_1.fromSignResultToDER(signature).toUpperCase() });
            var txBlob = ripple_binary_codec_1.default.encode(signedTx);
            var id = ripple_hashes_1.computeBinaryTransactionHash(txBlob);
            return {
                txId: id,
                txHex: txBlob
            };
        };
        this.getSignMessageHex = function (message) {
            var MAGIC_BYTES = Buffer.from("\x16Ripple Signed Message:\n", "utf-8");
            var messageBuffer = Buffer.from(message, "utf-8");
            var messageLength = Buffer.from(utils_1.numberToHex(messageBuffer.length), "hex");
            var buffer = Buffer.concat([MAGIC_BYTES, messageLength, messageBuffer]);
            return utils_1.hash256(buffer).toString("hex");
        };
    }
    return XRP;
}());
exports.XRP = XRP;
