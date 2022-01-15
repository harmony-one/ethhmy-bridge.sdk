import { Harmony } from '@harmony-js/core';
import { Contract } from '@harmony-js/contract';
import { connectToBrowserWallet } from './helpers';
import MyERC1155Abi from '../out/MyERC1155';
import { getAddress } from '@harmony-js/crypto';

interface IHmyMethodsInitParams {
  hmy: Harmony;
  hmyManagerContract: Contract;
  options?: { gasPrice: number; gasLimit: number };
}

export class HmyMethodsHRC1155 {
  private hmy: Harmony;
  private hmyManagerContract: Contract;
  private options = { gasPrice: 1000000000, gasLimit: 6721900 };

  private useOneWallet = false;
  private useMathWallet = false;

  constructor(params: IHmyMethodsInitParams) {
    this.hmy = params.hmy;
    this.hmyManagerContract = params.hmyManagerContract;

    if (params.options) {
      this.options = params.options;
    }
  }

  setUseMetamask = (value: boolean) => value;

  setUseOneWallet = (value: boolean) => {
    // @ts-ignore
    if (!window || !window.onewallet) {
      throw new Error('OneWallet extension is not found');
    }

    this.useOneWallet = value;
  };

  setUseMathWallet = (value: boolean) => {
    // @ts-ignore
    if (!window || !window.harmony) {
      throw new Error('Math Wallet extension is not found');
    }

    this.useMathWallet = value;
  };

  approveHmyManger = (hrc1155Address: string, sendTxCallback?: (addr: string) => void) => {
    const hmyTokenContract = this.hmy.contracts.createContract(MyERC1155Abi, hrc1155Address);

    return new Promise(async (resolve, reject) => {
      try {
        if (this.useOneWallet) {
          await connectToBrowserWallet(
            // @ts-ignore
            window.onewallet,
            this.hmy,
            hmyTokenContract.wallet,
            null,
            reject
          );
        }

        if (this.useMathWallet) {
          await connectToBrowserWallet(
            // @ts-ignore
            window.harmony,
            this.hmy,
            hmyTokenContract.wallet,
            null,
            reject
          );
        }

        const res = await hmyTokenContract.methods
          .setApprovalForAll(this.hmyManagerContract.address, true)
          .send(this.options)
          .on('transactionHash', sendTxCallback);

        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  };

  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////

  lockTokens = async (
    erc1155Address: string,
    userAddr: string,
    tokenIds: number[],
    amounts: number[],
    sendTxCallback?: (addr: string) => void
  ) => {
    return new Promise(async (resolve, reject) => {
      try {
        // TODO
        const hmyAddrHex = getAddress(userAddr).checksum;

        if (this.useOneWallet) {
          await connectToBrowserWallet(
            // @ts-ignore
            window.onewallet,
            this.hmy,
            this.hmyManagerContract.wallet,
            null,
            reject
          );
        }

        if (this.useMathWallet) {
          await connectToBrowserWallet(
            // @ts-ignore
            window.harmony,
            this.hmy,
            this.hmyManagerContract.wallet,
            null,
            reject
          );
        }

        const res = await this.hmyManagerContract.methods
          .lockHRC1155Tokens(erc1155Address, tokenIds, hmyAddrHex, amounts, [])
          .send(this.options)
          .on('transactionHash', sendTxCallback);

        // return transaction.events.Locked;

        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  };

  tokenDetails = async (erc1155Address: string) => {
    const erc1155Contract = this.hmy.contracts.createContract(MyERC1155Abi, erc1155Address);

    const tryOrDefault = async <T>(p: Promise<T>, d: T) => {
      try {
        return await p;
      } catch (e) {
        return d;
      }
    };

    const name = await tryOrDefault(erc1155Contract.methods.name().call(this.options), '');
    const symbol = await tryOrDefault(erc1155Contract.methods.symbol().call(this.options), '');
    const baseURI = await tryOrDefault(erc1155Contract.methods.uri(0).call(this.options), '');

    return { name, symbol, baseURI, erc1155Address };
  };

  balanceOf = async (erc1155Address: string, tokenId: string) => {
    // @ts-ignore
    const { address } = await window.onewallet.getAccount();
    const hmyAddrHex = getAddress(address).checksum;
    const erc721Contract = this.hmy.contracts.createContract(MyERC1155Abi, erc1155Address);

    return await erc721Contract.methods.balanceOf(hmyAddrHex, tokenId).call(this.options);
  };

  allowance = async (addr: string, erc1155Address: string) => {
    const hmyTokenContract = this.hmy.contracts.createContract(MyERC1155Abi, erc1155Address);
    const addrHex = this.hmy.crypto.getAddress(addr).checksum;

    return await hmyTokenContract.methods
      .allowance(addrHex, this.hmyManagerContract.address)
      .call(this.options);
  };
}
