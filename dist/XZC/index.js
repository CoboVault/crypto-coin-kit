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
// @ts-ignore
var zcore_lib_1 = require("zcore-lib");
var utils_1 = require("../utils");
var formatInput_1 = __importDefault(require("./formatInput"));
var processTransaction_1 = __importDefault(require("./processTransaction"));
var processTransactionSync_1 = __importDefault(require("./processTransactionSync"));
var XZC = /** @class */ (function () {
    function XZC(network) {
        var _this = this;
        this.generateAddress = function (publicKey) {
            var pubkey = new zcore_lib_1.PublicKey(publicKey);
            // only support P2PKH now
            return zcore_lib_1.Address.fromPublicKey(pubkey, _this.network).toString();
        };
        this.isAddressValid = function (address) {
            return zcore_lib_1.Address.isValid(address);
        };
        this.generateTransaction = function (txData, signer, options) { return __awaiter(_this, void 0, void 0, function () {
            var inputs, changeAddress, to, fee, amount, transaction;
            return __generator(this, function (_a) {
                inputs = txData.inputs, changeAddress = txData.changeAddress, to = txData.to, fee = txData.fee, amount = txData.amount;
                transaction = new zcore_lib_1.Transaction()
                    .from(formatInput_1.default(inputs))
                    .to(to, amount)
                    .fee(fee)
                    .change(changeAddress);
                return [2 /*return*/, processTransaction_1.default(transaction, signer.sign, options.signerPubkey)];
            });
        }); };
        this.generateTransactionSync = function (txData, signer, options) {
            var inputs = txData.inputs, changeAddress = txData.changeAddress, to = txData.to, fee = txData.fee, amount = txData.amount;
            var transaction = new zcore_lib_1.Transaction()
                .from(formatInput_1.default(inputs))
                .to(to, amount)
                .fee(fee)
                .change(changeAddress);
            return processTransactionSync_1.default(transaction, signer.sign, options.signerPubkey);
        };
        /**
         * @returns the return value is the (r,s,recId) of the signature
         */
        this.signMessage = function (message, signer) { return __awaiter(_this, void 0, void 0, function () {
            var hashHex, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        hashHex = this.getSignMessageHex(message);
                        return [4 /*yield*/, signer.sign(hashHex)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, "" + result.r + result.s + result.recId];
                }
            });
        }); };
        /**
         * @returns the return value is the (r,s,recId) of the signature
         */
        this.signMessageSync = function (message, signer) {
            var hashHex = _this.getSignMessageHex(message);
            var result = signer.sign(hashHex);
            return "" + result.r + result.s + result.recId;
        };
        this.getSignMessageHex = function (message) {
            var MAGIC_BYTES = Buffer.from("\x16Zcoin Signed Message:\n", "utf-8");
            var messageBuffer = Buffer.from(message, "utf-8");
            var messageLength = Buffer.from(utils_1.numberToHex(messageBuffer.length), "hex");
            var buffer = Buffer.concat([MAGIC_BYTES, messageLength, messageBuffer]);
            return utils_1.hash256(buffer).toString("hex");
        };
        this.network = network || "livenet";
    }
    return XZC;
}());
exports.XZC = XZC;
