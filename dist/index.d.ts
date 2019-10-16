import { DCR } from "./DCR";
import { ETH } from "./ETH";
import KeyProvider from "./keyProvider";
import NEO from "./NEO";
import * as utils from "./utils";
import { XRP } from "./XRP";
import { XZC } from "./XZC";
declare const _default: {
    coins: {
        XRP: typeof XRP;
        NEO: typeof NEO;
        XZC: typeof XZC;
        DCR: typeof DCR;
        ETH: typeof ETH;
    };
    KeyProvider: typeof KeyProvider;
    utils: typeof utils;
};
export default _default;
