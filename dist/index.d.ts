import KeyProvider from "./keyProvider";
import NEO from "./NEO";
import { XRP } from "./XRP";
import { XZC } from "./XZC";
declare const _default: {
    coins: {
        XRP: typeof XRP;
        NEO: typeof NEO;
        XZC: typeof XZC;
    };
    KeyProvider: typeof KeyProvider;
};
export default _default;
