// @ts-ignore
import hashjs from "hash.js";
// @ts-ignore
import { isValidAddress } from "ripple-address-codec";
// @ts-ignore
import binary from "ripple-binary-codec";
// @ts-ignore
import { computeBinaryTransactionHash } from "ripple-hashes";
// @ts-ignore
import { deriveAddress } from "ripple-keypairs";
import { SignProvider, SignProviderSync } from "../Common";
import { BaseTxData, Coin, GenerateTransactionResult } from "../Common/coin";
import { Result } from "../Common/sign";
import { fromSignResultToDER, hash256, numberToHex } from "../utils";

interface TxData extends BaseTxData {
  sequence: number;
  tag?: number;
  signingPubKey: string;
}

export class XRP implements Coin {
  public generateAddress = (publicKey: string) => {
    return deriveAddress(publicKey);
  };

  public isAddressValid = (address: string) => {
    return isValidAddress(address);
  };

  public generateTransaction = async (
    txData: TxData,
    signProvider: SignProvider,
    options?: any
  ): Promise<GenerateTransactionResult> => {
    const { unsignedTx, txJson } = this.generateUnsignedTx(txData);
    const signature = await signProvider.sign(unsignedTx);
    return this.getSignedTx(txJson, signature);
  };

  public generateTransactionSync = (
    txData: any,
    signProvider: SignProviderSync,
    options?: any
  ): GenerateTransactionResult => {
    const { unsignedTx, txJson } = this.generateUnsignedTx(txData);
    const signature = signProvider.sign(unsignedTx);
    return this.getSignedTx(txJson, signature);
  };

  public signMessage = async (
    message: string,
    signProvider: SignProvider
  ): Promise<string> => {
    const hashHex = this.getSignMessageHex(message);
    const { r, s } = await signProvider.sign(hashHex);
    return `${r}${s}`;
  };
  public signMessageSync = (
    message: string,
    signProvider: SignProviderSync
  ): string => {
    const hashHex = this.getSignMessageHex(message);
    const { r, s } = signProvider.sign(hashHex);
    return `${r}${s}`;
  };

  private generateUnsignedTx = (txData: TxData) => {
    const {
      amount,
      changeAddress,
      fee,
      sequence,
      signingPubKey,
      tag,
      to
    } = txData;
    const partialTx = {
      Account: changeAddress,
      Amount: amount.toString(),
      Destination: to,
      Fee: fee.toString(),
      Flags: 2147483648,
      Sequence: sequence,
      TransactionType: "Payment",
      SigningPubKey: signingPubKey
    };
    const txWithDestinationTag = tag
      ? { ...partialTx, DestinationTag: tag }
      : partialTx;
    const txHex = Buffer.from(
      binary.encodeForSigning(txWithDestinationTag),
      "hex"
    );
    const unsignedTx = Buffer.from(
      hashjs
        .sha512()
        .update(txHex)
        .digest()
        .slice(0, 32)
    ).toString("hex");
    return {
      unsignedTx,
      txJson: txWithDestinationTag
    };
  };

  private getSignedTx = (txJson: object, signature: Result) => {
    const signedTx = {
      ...txJson,
      TxnSignature: fromSignResultToDER(signature).toUpperCase()
    };
    console.log(signedTx);
    const txBlob = binary.encode(signedTx);
    const id = computeBinaryTransactionHash(txBlob);
    return {
      txId: id,
      txHex: txBlob
    };
  };

  private getSignMessageHex = (message: string) => {
    const MAGIC_BYTES = Buffer.from("\x16Ripple Signed Message:\n", "utf-8");
    const messageBuffer = Buffer.from(message, "utf-8");
    const messageLength = Buffer.from(numberToHex(messageBuffer.length), "hex");
    const buffer = Buffer.concat([MAGIC_BYTES, messageLength, messageBuffer]);

    return hash256(buffer).toString("hex");
  };
}
