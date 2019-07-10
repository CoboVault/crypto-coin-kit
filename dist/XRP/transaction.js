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
var ripple_binary_codec_1 = __importDefault(require("ripple-binary-codec"));
var TransactionBuilder = /** @class */ (function () {
    function TransactionBuilder(args) {
        this.flags = 2147483648;
        var transactionType = args.transactionType, account = args.account, amount = args.amount, destination = args.destination, destinationTag = args.destinationTag, fee = args.fee, sequence = args.sequence;
        this.transactionType = transactionType;
        this.account = account;
        this.amount = amount;
        this.destination = destination;
        this.destinationTag = destinationTag;
        this.fee = fee;
        this.sequence = sequence;
    }
    TransactionBuilder.prototype.toBinary = function () {
        var txJson = this.toJSON();
        return ripple_binary_codec_1.default.encodeForSigning(txJson);
    };
    TransactionBuilder.prototype.toJSON = function () {
        var partialTx = {
            Account: this.account,
            Amount: this.amount,
            Destination: this.destination,
            Fee: this.fee,
            Flags: this.flags,
            Sequence: this.sequence,
            TransactionType: this.transactionType
        };
        // DestinationTag: undefined or null will produce an unexpected 2E00000000 hex fragment in unsigned TX;
        return this.destinationTag
            ? __assign({}, partialTx, { DestinationTag: this.destinationTag }) : partialTx;
    };
    return TransactionBuilder;
}());
exports.TransactionBuilder = TransactionBuilder;
