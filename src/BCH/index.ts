import bchaddr from 'bchaddrjs';
import {AddressType, NetWorkType} from '../BTC';
import {BTCFORK} from '../BTC_FORK/BTCFORK';
import {bitcoincash, bitcoincash_testnet} from '../BTC_FORK/networks';

export enum AddressFormat {
  LEGACY,
  CASH,
  BITPAY,
}

export class BCH extends BTCFORK {
  constructor(networkType: NetWorkType = NetWorkType.mainNet) {
    super();
    this.network = this.initNetwork(networkType);
  }

  public generateAddress(
    publicKey: string,
    addressType: AddressType = AddressType.P2PKH,
    format?: AddressFormat,
  ) {
    const address = super.generateAddress(publicKey, addressType);
    return this.convertAddrFormat(address, format || AddressFormat.LEGACY);
  }

  public isAddressValid = (address: string) => {
    return bchaddr.isValidAddress(address);
  };

  public convertAddrFormat = (addr: string, destFormat: AddressFormat) => {
    switch (destFormat) {
      case AddressFormat.LEGACY:
        return bchaddr.toLegacyAddress(addr);
      case AddressFormat.BITPAY:
        return bchaddr.toBitpayAddress(addr);
      case AddressFormat.CASH:
        return bchaddr.toCashAddress(addr);
    }
    return addr;
  };

  protected initNetwork = (networkType: NetWorkType) => {
    if (networkType === NetWorkType.mainNet) {
      return bitcoincash;
    } else {
      return bitcoincash_testnet;
    }
  };
}
