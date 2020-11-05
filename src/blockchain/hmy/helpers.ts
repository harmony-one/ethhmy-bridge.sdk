import { Wallet } from '@harmony-js/account';
import { Harmony } from '@harmony-js/core';

export type TConnectToOneWallet = (
  hmy: Harmony,
  wallet: Wallet | any,
  addr: string,
  reject: (reason: string) => void
) => Promise<any>;

export const connectToOneWallet: TConnectToOneWallet = async (hmy, wallet, addrHex, reject) => {
  let userAddress = addrHex;

  if (!userAddress) {
    // @ts-ignore
    let { address } = await window.onewallet.getAccount();

    userAddress = hmy.crypto.getAddress(address).checksum;
  }

  wallet.defaultSigner = userAddress;

  wallet.signTransaction = async (tx: any) => {
    try {
      tx.from = userAddress;

      // @ts-ignore
      const signTx = await window.onewallet.signTransaction(tx);

      return signTx;
    } catch (e) {
      reject(e);
    }

    return null;
  };
};
