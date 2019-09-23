import { tx, wallet } from "@cityofzion/neon-core";
import hexEncoding from "crypto-js/enc-hex";
import sha256 from 'crypto-js/sha256';
import { ec as EC } from "elliptic";
import { SignProvider } from "../Common";
import { Result, SignProviderSync } from "../Common/sign";

const curve = new EC("p256");

export interface ExternalNeoBalance {
  address: string;
  net: string;
  balance: BalanceLike[];
}

interface UnspentItem {
  value: number;
  txid: string;
  n: number;
}

interface BalanceLike {
  asset_symbol: string;
  asset_hash: string;
  asset: string;
  amount: number;
  unspent: UnspentItem[];
}

export interface ClaimLike {
  value: number;
  unclaimed: number;
  txid: string;
  sys_fee: number;
  start_height?: number;
  n: number;
  generated: number;
  end_height?: number;
}

function signHex(hex: string, privateKey: string): {r:string, s: string} {
  const msgHash = sha256(hexEncoding.parse(hex)).toString();
  const msgHashHex = Buffer.from(msgHash, "hex");
  const privateKeyBuffer = Buffer.from(privateKey, "hex");

  const sig = curve.sign(msgHashHex, privateKeyBuffer);
  return {
    r: sig.r.toString("hex", 32),
    s: sig.s.toString("hex", 32),
  }
}


export const SignProviderWithPrivateKey = (
  privateKey: string
): SignProvider => {
  return {
    sign: async (hex: string): Promise<Result> => {
      const {r, s} = signHex(hex, privateKey)
      return {
        r,
        s,
        recId: 0
      };
    },
  };
};


export const SignProviderWithPrivateKeySync = (
  privateKey: string
): SignProviderSync => {
  return {
    sign: (hex: string):Result => {
      const {r, s} = signHex(hex, privateKey)
      return {
        r,
        s,
        recId: 0
      };
    },
  };
};


export const buildNeoBalance = (externalNeoBalance: ExternalNeoBalance) => {
  const address = externalNeoBalance.address;
  const net = externalNeoBalance.net;

  const assetSymbols: string[] = [];
  const assets: {
    [sym: string]: Partial<wallet.AssetBalanceLike>;
  } = {};

  const tokenSymbols: string[] = [];
  const tokens: {
    [sym: string]: number;
  } = {};

  const isAsset = (amount: number, unspent: UnspentItem[]) => {
    if (amount === 0 && unspent.length === 0) {
      return true;
    }
    if (amount !== 0 && unspent.length === 0) {
      return false;
    }
    if (amount !== 0 && unspent.length !== 0) {
      return true;
    }
    return true;
  };

  externalNeoBalance.balance.forEach(each => {
    if (isAsset(each.amount, each.unspent)) {
      tokenSymbols.push(each.asset_symbol);
      assets[each.asset_symbol] = {
        balance: each.amount,
        unspent: each.unspent.map(eachUnspent => ({
          value: eachUnspent.value,
          txid: eachUnspent.txid,
          index: eachUnspent.n
        }))
      };
    } else {
      tokenSymbols.push(each.asset_symbol);
      tokens[each.asset_symbol] = each.amount;
    }
  });

  return new wallet.Balance({
    address,
    net,
    assetSymbols,
    assets,
    tokens,
    tokenSymbols
  });
};

export const buildNeoClaims = (
  address: string,
  net: string,
  externalClaims: ClaimLike[]
) => {
  const claims: wallet.ClaimItemLike[] = externalClaims.map(each => ({
    claim: each.unclaimed,
    txid: each.txid,
    index: each.n,
    value: each.value,
    start: each.start_height,
    end: each.end_height
  }));
  return new wallet.Claims({
    address,
    net,
    claims
  });
};
