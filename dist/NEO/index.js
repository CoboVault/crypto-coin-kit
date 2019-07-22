"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var neon_core_1 = require("@cityofzion/neon-core");
var coin_1 = __importDefault(require("../Common/coin"));
var NEO = /** @class */ (function (_super) {
    __extends(NEO, _super);
    function NEO() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NEO.prototype.generateAddress = function (publicKey) {
        var account = new neon_core_1.wallet.Account(publicKey);
        return account.address;
    };
    NEO.prototype.generateUnsignedContractTx = function (txData) {
        var coinTx = new neon_core_1.tx.ContractTransaction()
            .addIntent(txData['tokenName'], txData['amount'], txData['to']);
        if (txData['memo']) {
            coinTx.addRemark(txData['memo']);
        }
        coinTx.calculate(txData['balance']);
        return coinTx.serialize(false);
    };
    return NEO;
}(coin_1.default));
exports.default = NEO;
