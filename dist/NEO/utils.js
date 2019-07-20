"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var neon_core_1 = require("@cityofzion/neon-core");
exports.SignProviderWithPrivateKey = function (privateKey) {
    return {
        sign: function (hex) {
            var signedTx = neon_core_1.tx.Transaction.deserialize(hex).sign(privateKey);
            return {
                hex: signedTx.serialize(),
                id: signedTx.hash
            };
        }
    };
};
