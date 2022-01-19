import { Harmony } from '@harmony-js/core';
import { Contract } from '@harmony-js/contract';
import { getAddress } from '@harmony-js/crypto';

import { connectToBrowserWallet } from './helpers';
import MyERC721Abi from '../out/MyERC721';

interface IHmyMethodsInitParams {
  hmy: Harmony;
  hmyManagerContract: Contract;
  options?: { gasPrice: number; gasLimit: number };
}

export class HmyMethodsHRC721 {
  private hmy: Harmony;
  private hmyManagerContract: Contract;
  private options = { gasPrice: 30000000000, gasLimit: 6721900 };

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

  approveHmyManger = (hrc721Address: string, sendTxCallback?: (addr: string) => void) => {
    const hmyTokenContract = this.hmy.contracts.createContract(MyERC721Abi, hrc721Address);

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
    erc721Address: string,
    userAddr: string,
    tokenIds: number[],
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
          .lockTokens(erc721Address, tokenIds, hmyAddrHex)
          .send(this.options)
          .on('transactionHash', sendTxCallback);

        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  };

  tokenDetails = async (erc721Address: string) => {
    const erc721Contract = this.hmy.contracts.createContract(MyERC721Abi, erc721Address);

    const name = await erc721Contract.methods.name().call(this.options);
    const symbol = await erc721Contract.methods.symbol().call(this.options);
    const baseURI = await erc721Contract.methods.baseURI().call(this.options);

    return { name, symbol, baseURI, erc721Address };
  };

  balanceOf = async (erc721Address: string) => {
    // @ts-ignore
    const { address } = await window.onewallet.getAccount();
    const hmyAddrHex = getAddress(address).checksum;
    const erc721Contract = this.hmy.contracts.createContract(MyERC721Abi, erc721Address);

    return await erc721Contract.methods.balanceOf(hmyAddrHex).call(this.options);
  };

  allowance = async (addr: string, erc721Address: string) => {
    const hmyTokenContract = this.hmy.contracts.createContract(MyERC721Abi, erc721Address);

    const addrHex = this.hmy.crypto.getAddress(addr).checksum;

    return await hmyTokenContract.methods
      .allowance(addrHex, this.hmyManagerContract.address)
      .call(this.options);
  };
}
