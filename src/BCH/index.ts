import bchaddr from 'bchaddrjs';
import {default as bitcoin, Transaction} from "bitcoinjs-lib";
import {AddressType, BTC, NetWorkType} from "../BTC";

import {Network, Psbt, SIGHASH_FORKID, TxData} from "../BTC_FORK";
import {BTCFORK} from "../BTC_FORK/BTCFORK";
import {bitcoincash, bitcoincash_testnet} from "../BTC_FORK/networks";
import {KeyProvider, KeyProviderSync} from "../Common/sign";

export enum AddressFormat {
    LEGACY,
    CASH,
    BITPAY
}

export class BCH extends BTCFORK {
    constructor(networkType: NetWorkType = NetWorkType.mainNet) {
        super();
        this.network = this.initNetwork(networkType)
    }

    public initNetwork = (networkType: NetWorkType) => {
        if (networkType === NetWorkType.mainNet) {
            return  bitcoincash;
        } else {
            return  bitcoincash_testnet;
        }
    };

    public generateAddress(publicKey: string,
                           addressType: AddressType = AddressType.P2PKH,
                           format?: AddressFormat) {
        const address = super.generateAddress(publicKey, addressType);
        return this.convertAddrFormat(address, format || AddressFormat.LEGACY);
    };

    public convertAddrFormat = (addr: string,
                                destFormat: AddressFormat) => {
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
}