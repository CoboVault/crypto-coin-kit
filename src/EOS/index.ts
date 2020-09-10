// @ts-ignore
import BigNumber from 'bignumber.js';
import {Buffer} from 'buffer';
// @ts-ignore
import EosInstance from 'eosjs';
// @ts-ignore
import eosEcc from 'eosjs-ecc';
// @ts-ignore
import {sha256, Signature} from 'eosjs-ecc';
// @ts-ignore
import FcBuffer from 'fcbuffer';
import {SignProvider, SignProviderSync} from '../Common';
import {Coin} from '../Common/coin';
import {Result} from '../Common/sign';
import numberToHex from '../utils/numberToHex';

export interface Header {
  time: number;
  expireInSeconds: number;
  refBlockNum: number;
  refBlockPrefix: number;
}

export interface Data {
  from: string;
  to: string;
  amount: number;
  symbol?: string;
  memo: string;
  fee: number;
  decimal: number;
}

export interface TxData {
  type?: string;
  tokenAccount?: string;
  data: Data;
  header: Header;
}

export class EOS implements Coin {
  private chainId =
    'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906';
  public generateAddress = (pubKey: string) => {
    return eosEcc.PublicKey(Buffer.from(pubKey, 'hex')).toString();
  };

  public isAddressValid = (address: string) => {
    return eosEcc.isValidPublic(address);
  };

  public generateTransaction = async (txData: TxData, signer: SignProvider) => {
    const eosInstance = this.getEosInstance(
      txData.header,
      this.getSignProvider(signer),
    );
    if (txData.tokenAccount) {
      const {tokenAccount} = txData;
      eosInstance.fc.abiCache.abi(
        tokenAccount,
        eosInstance.fc.abiCache.abi('eosio.token').abi,
      );
    }
    const tx = await eosInstance.transaction({
      actions: [
        {
          account: txData.tokenAccount || 'eosio.token',
          name: txData.type || 'transfer',
          authorization: [
            {
              actor: txData.data.from,
              permission: 'active',
            },
          ],
          data: {
            from: txData.data.from,
            to: txData.data.to,
            quantity: this.toEOSAmount(
              txData.data.amount,
              txData.data.symbol,
              txData.data.decimal,
            ),
            memo: txData.data.memo || '',
          },
        },
      ],
    });
    return {txId: tx.transaction_id, txHex: JSON.stringify(tx.transaction)};
  };

  public generateTransactionSync = (
    txData: TxData,
    signer: SignProviderSync,
  ) => {
    const eosInstance = EosInstance({
      httpEndpoint: null,
    });
    if (txData.tokenAccount) {
      const {tokenAccount} = txData;
      eosInstance.fc.abiCache.abi(
        tokenAccount,
        eosInstance.fc.abiCache.abi('eosio.token').abi,
      );
    }

    const Transaction = eosInstance.fc.structs.transaction;
    const defaultHeaders = {
      max_net_usage_words: 0,
      max_cpu_usage_ms: 0,
      delay_sec: 0,
    };
    const rawTx = Object.assign(
      {},
      defaultHeaders,
      this.formatHeaders(txData.header),
    );
    // @ts-ignore
    rawTx.actions = [
      {
        account: txData.tokenAccount || 'eosio.token',
        name: txData.type || 'transfer',
        authorization: [
          {
            actor: txData.data.from,
            permission: 'active',
          },
        ],
        data: {
          from: txData.data.from,
          to: txData.data.to,
          quantity: this.toEOSAmount(
            txData.data.amount,
            txData.data.symbol,
            txData.data.decimal,
          ),
          memo: txData.data.memo || '',
        },
      },
    ];
    // @ts-ignore
    rawTx.transaction_extensions = [];

    const txObject = Transaction.fromObject(rawTx);
    const buf = FcBuffer.toBuffer(Transaction, txObject);
    const txId = sha256(buf);
    const tr = Transaction.toObject(txObject);
    const signBuf = Buffer.concat([
      Buffer.from(this.chainId, 'hex'),
      Buffer.from(buf, 'hex'),
      new Buffer(new Uint8Array(32)),
    ]);

    const sig = this.getSignProviderSync(signer)({buf: signBuf});
    const packedTr = {
      compression: 'none',
      transaction: tr,
      signatures: [sig],
    };
    return {txId, txHex: JSON.stringify(packedTr)};
  };

  public signMessage = async (message: string, signer: SignProvider) => {
    const hash = sha256(Buffer.from(message, 'utf8'));
    const sig = await signer.sign(hash.toString('hex'));
    return numberToHex(sig.recId + 4 + 27)
      .concat(sig.r)
      .concat(sig.s);
  };

  public signMessageSync = (message: string, signer: SignProviderSync) => {
    const hash = sha256(Buffer.from(message, 'utf8'));
    const sig = signer.sign(hash.toString('hex'));
    return numberToHex(sig.recId + 4 + 27)
      .concat(sig.r)
      .concat(sig.s);
  };

  private getSignProvider(signer: SignProvider) {
    return async (tx: any) => {
      const sig = await signer.sign(sha256(tx.buf));
      return this.buildSignature(sig);
    };
  }

  private getSignProviderSync(signer: SignProviderSync) {
    return (tx: any) => {
      const sig = signer.sign(sha256(tx.buf));
      return this.buildSignature(sig);
    };
  }

  private getEosInstance = (txHeader: Header, eosSignProvider: any) => {
    const headers = this.formatHeaders(txHeader);
    return EosInstance({
      signProvider: eosSignProvider,
      transactionHeaders: (expireInSeconds: number, callback: any) =>
        callback(null, headers),
      broadcast: false,
      sign: true,
      chainId: this.chainId,
      httpEndpoint: null,
    });
  };

  private formatHeaders(header: Header) {
    return {
      expiration: this.getExpiration(header),
      ref_block_num: header.refBlockNum & 0xffff,
      ref_block_prefix: header.refBlockPrefix,
      time: header.time,
    };
  }

  private toEOSAmount = (amount: number, symbol = 'EOS', decimal: number) => {
    const divider = new BigNumber(10).pow(decimal);
    return (
      new BigNumber(amount).dividedBy(divider).toFixed(decimal) + ' ' + symbol
    );
  };

  private getExpiration = (txHeader: Header) => {
    const expireInSeconds = txHeader.expireInSeconds || 1800;
    return new Date(txHeader.time + expireInSeconds * 1000)
      .toISOString()
      .split('.')[0];
  };

  private buildSignature(sig: Result) {
    const r = Buffer.from(sig.r, 'hex');
    const s = Buffer.from(sig.s, 'hex');
    return Signature.fromBuffer(
      Buffer.concat([Buffer.alloc(1, sig.recId + 4 + 27), r, s]),
    ).toString();
  }
}
