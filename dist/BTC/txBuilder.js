"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var bitcoin = __importStar(require("bitcoinjs-lib"));
var MAX_FEE = 1000000;
var PsbtBuilder = /** @class */ (function () {
    function PsbtBuilder(network) {
        var _this = this;
        this.addInputsForPsbt = function (txData) {
            if (_this.verifyInput(txData)) {
                txData.inputs.forEach(function (eachInput) {
                    if (_this.isNonWitnessUtxo(eachInput.utxo)) {
                        return _this.psbt.addInput({
                            hash: eachInput.hash,
                            index: eachInput.index,
                            nonWitnessUtxo: Buffer.from(eachInput.utxo.nonWitnessUtxo, "hex")
                        });
                    }
                    else {
                        return _this.psbt.addInput({
                            hash: eachInput.hash,
                            index: eachInput.index,
                            witnessUtxo: {
                                script: Buffer.from(eachInput.utxo.script, "hex"),
                                value: eachInput.utxo.value
                            },
                            redeemScript: bitcoin.payments.p2wpkh({
                                pubkey: Buffer.from(eachInput.utxo.publicKey, "hex"),
                                network: _this.network
                            }).output
                        });
                    }
                });
                return _this;
            }
            throw new Error("input value are invaild");
        };
        this.addOutputForPsbt = function (txData) {
            if (_this.isDestinationOutputs(txData.outputs)) {
                _this.psbt.addOutput({
                    address: txData.outputs.to,
                    value: txData.outputs.amount
                });
                var totalInputs = txData.inputs.reduce(function (acc, cur) { return acc + cur.utxo.value; }, 0);
                var changeAmount = totalInputs - txData.outputs.amount - txData.outputs.fee;
                _this.psbt.addOutput({
                    address: txData.outputs.changeAddres,
                    value: changeAmount
                });
            }
            else {
                _this.psbt.addOutputs(txData.outputs);
            }
            return _this;
        };
        this.getPsbt = function () {
            return _this.psbt;
        };
        this.verifyInput = function (txData, disableLargeFee) {
            if (disableLargeFee === void 0) { disableLargeFee = true; }
            var totalInputs = txData.inputs.reduce(function (acc, cur) { return acc + cur.utxo.value; }, 0);
            if (_this.isDestinationOutputs(txData.outputs)) {
                if (totalInputs >= txData.outputs.fee + txData.outputs.amount) {
                    return true;
                }
            }
            else {
                var totalOuputs = txData.outputs.reduce(function (acc, cur) { return acc + cur.value; }, 0);
                var fee = totalInputs - totalOuputs;
                if (fee >= 0 && (disableLargeFee ? fee < MAX_FEE : true)) {
                    return true;
                }
            }
            return false;
        };
        this.isNonWitnessUtxo = function (utxo) {
            return utxo.nonWitnessUtxo !== undefined;
        };
        this.isDestinationOutputs = function (out) {
            var output = out;
            return (output.to !== undefined &&
                output.amount !== undefined &&
                output.fee !== undefined &&
                output.changeAddres !== undefined);
        };
        this.network = network;
        this.psbt = new bitcoin.Psbt({ network: network });
    }
    return PsbtBuilder;
}());
exports.default = PsbtBuilder;
