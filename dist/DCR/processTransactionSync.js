"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
var dcr_core_1 = require("dcr-core");
var utils_1 = require("../utils");
var signScript = function (transaction, sigType, index, script, sign) {
    var sighash = dcr_core_1.Transaction.Sighash.sighash(transaction, sigType, index, script);
    var hex = utils_1.reverseBuffer(sighash).toString("hex");
    var signResult = sign(hex);
    return utils_1.fromSignResultToDER(signResult);
};
var getSignatureForInput = function (input, index, transaction, sigType, publicKey, sign) {
    return new dcr_core_1.Transaction.Signature({
        publicKey: publicKey,
        prevTxId: input.prevTxId,
        outputIndex: input.outputIndex,
        inputIndex: index,
        signature: signScript(transaction, sigType, index, input.output.script, sign),
        sigtype: sigType
    });
};
exports.default = (function (transaction, sign, publicKey, txConfig) {
    var sigType = 0x01; // SIGHASH_ALL
    var inputs = transaction.inputs;
    var actions = inputs.map(function (input, index) {
        return getSignatureForInput(input, index, transaction, sigType, publicKey, sign);
    });
    actions.forEach(function (value) {
        transaction.applySignature(value);
    });
    var txHex = transaction.serialize(txConfig);
    var txObj = transaction.toObject();
    return {
        txHex: txHex,
        txId: txObj.hash
    };
});
