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
        },
        signMessage: function (hex) {
            return neon_core_1.wallet.sign(hex, privateKey);
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
        tokenSymbols: tokenSymbols,
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
