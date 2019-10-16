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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var bitcoin = __importStar(require("bitcoinjs-lib"));
// @ts-ignore
var bs58check_1 = __importDefault(require("bs58check"));
var safe_buffer_1 = require("safe-buffer");
var utils_1 = require("../utils");
var txBuilder_1 = __importDefault(require("./txBuilder"));
var AddressType;
(function (AddressType) {
    AddressType["P2PKH"] = "P2PKH";
    AddressType["P2SH"] = "P2SH";
    AddressType["P2WPKH"] = "P2WPKH";
})(AddressType || (AddressType = {}));
var NetWorkType;
(function (NetWorkType) {
    NetWorkType["mainNet"] = "mainNet";
    NetWorkType["testNet"] = "testNet";
})(NetWorkType = exports.NetWorkType || (exports.NetWorkType = {}));
var BTC = /** @class */ (function () {
    function BTC(networkType) {
        var _this = this;
        if (networkType === void 0) { networkType = NetWorkType.mainNet; }
        this.generateAddress = function (publicKey, addressType) {
            if (addressType === void 0) { addressType = AddressType.P2SH; }
            var btcAddress;
            var pubkeyBuffer = safe_buffer_1.Buffer.from(publicKey, "hex");
            if (addressType === AddressType.P2PKH) {
                var address = bitcoin.payments.p2pkh({
                    pubkey: pubkeyBuffer,
                    network: _this.network
                }).address;
                btcAddress = address;
            }
            if (addressType === AddressType.P2SH) {
                var address = bitcoin.payments.p2sh({
                    redeem: bitcoin.payments.p2wpkh({
                        pubkey: pubkeyBuffer,
                        network: _this.network
                    }),
                    network: _this.network
                }).address;
                btcAddress = address;
            }
            if (addressType === AddressType.P2WPKH) {
                var address = bitcoin.payments.p2wpkh({
                    pubkey: pubkeyBuffer,
                    network: _this.network
                }).address;
                btcAddress = address;
            }
            if (btcAddress) {
                return btcAddress;
            }
            else {
                throw new Error("generate address failed");
            }
        };
        this.isAddressValid = function (address) {
            if (address.startsWith("1") ||
                address.startsWith("3") ||
                address.startsWith("2") ||
                address.startsWith("bc")) {
                try {
                    bs58check_1.default.decode(address);
                    return true;
                }
                catch (e) {
                    return false;
                }
            }
            else {
                return false;
            }
        };
        this.generateTransaction = function (txData, signers) { return __awaiter(_this, void 0, void 0, function () {
            var psbtBuilder, psbt, _loop_1, _i, signers_1, signer;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        psbtBuilder = new txBuilder_1.default(this.network);
                        psbt = psbtBuilder
                            .addInputsForPsbt(txData)
                            .addOutputForPsbt(txData)
                            .getPsbt();
                        _loop_1 = function (signer) {
                            var keyPair;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        keyPair = {
                                            publicKey: Buffer.from(signer.publicKey, "hex"),
                                            sign: function (hashBuffer) { return __awaiter(_this, void 0, void 0, function () {
                                                var hexString, _a, r, s;
                                                return __generator(this, function (_b) {
                                                    switch (_b.label) {
                                                        case 0:
                                                            hexString = hashBuffer.toString("hex");
                                                            return [4 /*yield*/, signer.sign(hexString)];
                                                        case 1:
                                                            _a = _b.sent(), r = _a.r, s = _a.s;
                                                            return [2 /*return*/, Buffer.concat([Buffer.from(r, "hex"), Buffer.from(s, "hex")])];
                                                    }
                                                });
                                            }); }
                                        };
                                        return [4 /*yield*/, psbt.signAllInputsAsync(keyPair)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        };
                        _i = 0, signers_1 = signers;
                        _a.label = 1;
                    case 1:
                        if (!(_i < signers_1.length)) return [3 /*break*/, 4];
                        signer = signers_1[_i];
                        return [5 /*yield**/, _loop_1(signer)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, this.extractTx(psbt)];
                }
            });
        }); };
        this.generateTransactionSync = function (txData, signers) {
            var psbtBuilder = new txBuilder_1.default(_this.network);
            var psbt = psbtBuilder
                .addInputsForPsbt(txData)
                .addOutputForPsbt(txData)
                .getPsbt();
            var _loop_2 = function (signer) {
                var keyPair = {
                    publicKey: Buffer.from(signer.publicKey, "hex"),
                    sign: function (hashBuffer) {
                        var hexString = hashBuffer.toString("hex");
                        var _a = signer.sign(hexString), r = _a.r, s = _a.s;
                        return Buffer.concat([Buffer.from(r, "hex"), Buffer.from(s, "hex")]);
                    }
                };
                psbt.signAllInputs(keyPair);
            };
            for (var _i = 0, signers_2 = signers; _i < signers_2.length; _i++) {
                var signer = signers_2[_i];
                _loop_2(signer);
            }
            return _this.extractTx(psbt);
        };
        this.signMessage = function (message, signer) { return __awaiter(_this, void 0, void 0, function () {
            var hashHex, _a, r, s;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        hashHex = this.constructMessageHash(message);
                        return [4 /*yield*/, signer.sign(hashHex)];
                    case 1:
                        _a = _b.sent(), r = _a.r, s = _a.s;
                        return [2 /*return*/, "" + r + s];
                }
            });
        }); };
        this.signMessageSync = function (message, singerSync) {
            var hashHex = _this.constructMessageHash(message);
            var _a = singerSync.sign(hashHex), r = _a.r, s = _a.s;
            return "" + r + s;
        };
        this.generatePsbt = function (txData) {
            var psbtBuilder = new txBuilder_1.default(_this.network);
            var psbt = psbtBuilder
                .addInputsForPsbt(txData)
                .addOutputForPsbt(txData)
                .getPsbt();
            return psbt.toBase64();
        };
        this.parsePsbt = function (psbtString) {
            var psbt = bitcoin.Psbt.fromBase64(psbtString);
            var txBuffer = psbt.data.getTransaction();
            var tx = bitcoin.Transaction.fromBuffer(txBuffer);
            var inputs = tx.ins.map(function (each) { return ({
                txId: each.hash.reverse().toString("hex"),
                index: each.index
            }); });
            var outputs = tx.outs.map(function (each) {
                var address = bitcoin.address.fromOutputScript(each.script, _this.network);
                var eachOutput = each;
                var value = eachOutput.value;
                return {
                    address: address,
                    value: value
                };
            });
            return {
                inputs: inputs,
                outputs: outputs
            };
        };
        this.signPsbt = function (psbtString, signers) { return __awaiter(_this, void 0, void 0, function () {
            var psbt, _loop_3, _i, signers_3, signer;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        psbt = bitcoin.Psbt.fromBase64(psbtString);
                        _loop_3 = function (signer) {
                            var keyPair;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        keyPair = {
                                            publicKey: Buffer.from(signer.publicKey, "hex"),
                                            sign: function (hashBuffer) { return __awaiter(_this, void 0, void 0, function () {
                                                var hexString, _a, r, s;
                                                return __generator(this, function (_b) {
                                                    switch (_b.label) {
                                                        case 0:
                                                            hexString = hashBuffer.toString("hex");
                                                            return [4 /*yield*/, signer.sign(hexString)];
                                                        case 1:
                                                            _a = _b.sent(), r = _a.r, s = _a.s;
                                                            return [2 /*return*/, Buffer.concat([Buffer.from(r, "hex"), Buffer.from(s, "hex")])];
                                                    }
                                                });
                                            }); }
                                        };
                                        return [4 /*yield*/, psbt.signAllInputsAsync(keyPair)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        };
                        _i = 0, signers_3 = signers;
                        _a.label = 1;
                    case 1:
                        if (!(_i < signers_3.length)) return [3 /*break*/, 4];
                        signer = signers_3[_i];
                        return [5 /*yield**/, _loop_3(signer)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, this.extractTx(psbt)];
                }
            });
        }); };
        this.signPsbtSync = function (psbtString, signers) {
            var psbt = bitcoin.Psbt.fromBase64(psbtString);
            var _loop_4 = function (signer) {
                var keyPair = {
                    publicKey: Buffer.from(signer.publicKey, "hex"),
                    sign: function (hashBuffer) {
                        var hexString = hashBuffer.toString("hex");
                        var _a = signer.sign(hexString), r = _a.r, s = _a.s;
                        return Buffer.concat([Buffer.from(r, "hex"), Buffer.from(s, "hex")]);
                    }
                };
                psbt.signAllInputs(keyPair);
            };
            for (var _i = 0, signers_4 = signers; _i < signers_4.length; _i++) {
                var signer = signers_4[_i];
                _loop_4(signer);
            }
            return _this.extractTx(psbt);
        };
        this.constructMessageHash = function (message) {
            var MAGIC_BYTES = Buffer.from(_this.network.messagePrefix, "utf-8");
            var messageBuffer = Buffer.from(message, "utf-8");
            var messageLength = Buffer.from(utils_1.numberToHex(messageBuffer.length), "hex");
            var buffer = Buffer.concat([MAGIC_BYTES, messageLength, messageBuffer]);
            var hashHex = utils_1.hash256(buffer).toString("hex");
            return hashHex;
        };
        this.extractTx = function (psbt) {
            if (psbt.validateSignaturesOfAllInputs()) {
                psbt.finalizeAllInputs();
                var txHex = psbt.extractTransaction().toHex();
                var txId = psbt.extractTransaction().getId();
                return {
                    txId: txId,
                    txHex: txHex
                };
            }
            throw new Error("signature verification failed");
        };
        if (networkType === NetWorkType.mainNet) {
            this.network = bitcoin.networks.bitcoin;
        }
        else {
            this.network = bitcoin.networks.regtest;
        }
    }
    return BTC;
}());
exports.default = BTC;
