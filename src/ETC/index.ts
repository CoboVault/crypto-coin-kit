import Common from "ethereumjs-common";
import {Transaction} from "ethereumjs-tx";
import {ETH, TxData} from "../ETH";

const ETC_CHAIN_ID = 61;
export class ETC extends ETH{
    constructor() {
        super(ETC_CHAIN_ID);
    }
    protected constructTransaction = (data: TxData) => {
        const customCommon  = Common.forCustomChain(  'mainnet',
            {
                chainId: ETC_CHAIN_ID,
            },
            'byzantium',);
        return new Transaction(this.formatTxData(data),{common: customCommon})
    }
}