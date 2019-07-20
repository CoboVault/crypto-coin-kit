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
exports.buildNeoBalance = function (externalNeoBalance) {
    var address = externalNeoBalance['address'];
    var net = externalNeoBalance['net'];
    var assetSymbols = [];
    var assets = {};
    externalNeoBalance.balance.forEach(function (each) {
        if (each['asset_symbol']) {
            assetSymbols.push(each['asset_symbol']);
            assets[each['asset_symbol']] = {
                balance: each['amount'],
                unspent: each.unspent.map(function (eachUnspent) { return ({
                    value: eachUnspent['value'],
                    txid: eachUnspent['txid'],
                    index: eachUnspent['n']
                }); })
            };
        }
    });
    return new neon_core_1.wallet.Balance({
        address: address,
        net: net,
        assetSymbols: assetSymbols,
        assets: assets
    });
};
