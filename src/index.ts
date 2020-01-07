import { BCH } from "./BCH";
import { BTC } from "./BTC";
import {DASH} from "./DASH";
import { DCR } from "./DCR";
import { ETC } from "./ETC";
import { ETH } from "./ETH";
import KeyProvider from "./keyProvider";
import {LTC} from "./LTC";
import { NEO } from "./NEO";
import {TRX} from "./TRX";
import * as utils from "./utils";
import { XRP } from "./XRP";
import { XZC } from "./XZC";

export default {
  coins: {
    XRP,
    NEO,
    XZC,
    DCR,
    ETH,
    BTC,
    ETC,
    BCH,
    DASH,
    LTC,
    TRX
  },
  KeyProvider,
  utils
};
