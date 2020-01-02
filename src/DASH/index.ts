// @ts-ignore
import bs58check from "bs58check";
import {AddressType} from "../BTC";
import {BTCFORK} from "../BTC_FORK/BTCFORK";
import {dash} from "../BTC_FORK/networks";

export class DASH extends BTCFORK{
    constructor() {
        super();
        this.network = dash
    }

    public generateAddress(publicKey: string,
                           addressType: AddressType = AddressType.P2PKH): string {
        return super.generateAddress(publicKey, addressType);
    }

    public isAddressValid = (address: string) => {
        if (address.startsWith('X')) {
            try {
                bs58check.decode(address);
                return true;
            } catch (e) {
                return false;
            }
        }
        return false;
    };
}
