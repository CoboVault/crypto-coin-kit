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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
var hash_js_1 = __importDefault(require("hash.js"));
// @ts-ignore
var ripple_binary_codec_1 = __importDefault(require("ripple-binary-codec"));
// @ts-ignore
var ripple_hashes_1 = require("ripple-hashes");
var utils_1 = require("../utils");
var TransactionBuilder = /** @class */ (function () {
    function TransactionBuilder(args) {
        this.flags = 2147483648;
        var transactionType = args.transactionType, account = args.account, amount = args.amount, destination = args.destination, destinationTag = args.destinationTag, fee = args.fee, sequence = args.sequence, signingPubKey = args.signingPubKey;
        this.transactionType = transactionType;
        this.account = account;
        this.amount = amount;
        this.destination = destination;
        this.destinationTag = destinationTag;
        this.fee = fee;
        this.sequence = sequence;
        this.signingPubKey = signingPubKey;
    }
    TransactionBuilder.prototype.getUnsignedTx = function () {
        var txBytes = this.toBytes();
        return Buffer.from(hash_js_1.default
            .sha512()
            .update(txBytes)
            .digest()
            .slice(0, 32)).toString("hex");
    };
    TransactionBuilder.prototype.addSignature = function (signature) {
        this.txnSignature = utils_1.toDER(signature);
    };
    TransactionBuilder.prototype.getSignedTx = function () {
        var txBlob = ripple_binary_codec_1.default.encode(this.toJSON());
        var id = ripple_hashes_1.computeBinaryTransactionHash(txBlob);
        return {
            id: id,
            txBlob: txBlob
        };
    };
    TransactionBuilder.prototype.toBytes = function () {
        var txHex = this.toHex();
        return Buffer.from(txHex, 'hex');
    };
    TransactionBuilder.prototype.toHex = function () {
        var txJson = this.toJSON();
        if (txJson.hasOwnProperty("TxnSignature")) {
            throw new Error("can not encode a signed tx");
        }
        return ripple_binary_codec_1.default.encodeForSigning(txJson);
    };
    // parse current instance to JSON
    TransactionBuilder.prototype.toJSON = function () {
        var partialTx = {
            Account: this.account,
            Amount: this.amount,
            Destination: this.destination,
            Fee: this.fee,
            Flags: this.flags,
            Sequence: this.sequence,
            TransactionType: this.transactionType,
            SigningPubKey: this.signingPubKey
        };
        // DestinationTag: undefined or null will produce an unexpected 2E00000000 hex fragment in unsigned TX;
        var txWithDetinationTag = this.destinationTag
            ? __assign({}, partialTx, { DestinationTag: this.destinationTag }) : partialTx;
        // if this is a signed tx
        return this.txnSignature
            ? __assign({}, txWithDetinationTag, { TxnSignature: this.txnSignature }) : txWithDetinationTag;
    };
    return TransactionBuilder;
}());
exports.TransactionBuilder = TransactionBuilder;
