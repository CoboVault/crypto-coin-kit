import Common from 'ethereumjs-common';
import {Transaction} from 'ethereumjs-tx';
import {ETH, RawTxData, TxData} from '../ETH';

const ETC_CHAIN_ID = 61;
export class ETC extends ETH {
  constructor() {
    super(ETC_CHAIN_ID);
  }
  protected constructTransaction = (data: TxData|RawTxData) => {
    const customCommon = Common.forCustomChain(
      'mainnet',
      {
        chainId: ETC_CHAIN_ID,
      },
      'byzantium',
    );
    return new Transaction(this.formatTxData(data as TxData), {common: customCommon});
  };
}
