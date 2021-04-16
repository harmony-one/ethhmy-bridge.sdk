import { Harmony } from '@harmony-js/core';
import { Contract } from '@harmony-js/contract';
import { withDecimals } from '../utils';
import MyERC20Abi from '../out/MyERC20';
import { connectToBrowserWallet } from './helpers';

interface IHmyMethodsInitParams {
  hmy: Harmony;
  hmyManagerContract: Contract;
  options?: { gasPrice: number; gasLimit: number };
}

export class HmyMethodsERC20 {
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

  approveHmyManger = (
    hrc20Address: string,
    amount: number,
    decimals: number,
    sendTxCallback?: (hash: string) => void
  ) => {
    const hmyTokenContract = this.hmy.contracts.createContract(MyERC20Abi, hrc20Address);

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
          .approve(this.hmyManagerContract.address, withDecimals(amount, decimals))
          .send(this.options)
          .on('transactionHash', sendTxCallback);

        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  };

  burnToken = async (
    hrc20Address: string,
    userAddr: string,
    amount: number,
    decimals: number,
    sendTxCallback?: (hash: string) => void
  ) => {
    return new Promise(async (resolve, reject) => {
      try {
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

        const response = await this.hmyManagerContract.methods
          .burnToken(hrc20Address, withDecimals(amount, decimals), userAddr)
          .send(this.options)
          .on('transactionHash', sendTxCallback);

        resolve(response);
      } catch (e) {
        reject(e);
      }
    });
  };

  getMappingFor = async (erc20TokenAddr: string) => {
    const res = await this.hmyManagerContract.methods.mappings(erc20TokenAddr).call(this.options);

    return res;
  };

  checkHmyBalance = async (hrc20Address: string, addr: string) => {
    const hmyTokenContract = this.hmy.contracts.createContract(MyERC20Abi, hrc20Address);

    const addrHex = this.hmy.crypto.getAddress(addr).checksum;

    return await hmyTokenContract.methods.balanceOf(addrHex).call(this.options);
  };

  totalSupply = async (hrc20Address: string) => {
    const hmyTokenContract = this.hmy.contracts.createContract(MyERC20Abi, hrc20Address);

    return await hmyTokenContract.methods.totalSupply().call(this.options);
  };

  setApprovalForAll = (hrc20Address: string, sendTxCallback?: (hash: string) => void) => {
    const hmyTokenContract = this.hmy.contracts.createContract(MyERC20Abi, hrc20Address);

    return new Promise(async (resolve, reject) => {
      try {
        let hmyAddrHex;

        if (this.useOneWallet) {
          await connectToBrowserWallet(
            // @ts-ignore
            window.onewallet,
            this.hmy,
            this.hmyManagerContract.wallet,
            null,
            reject
          );

          // @ts-ignore
          const { address } = await window.onewallet.getAccount();
          hmyAddrHex = this.hmy.crypto.getAddress(address).checksum;
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

          // @ts-ignore
          const { address } = await window.onewallet.getAccount();
          hmyAddrHex = this.hmy.crypto.getAddress(address).checksum;
        }

        if (!this.useMathWallet && !this.useOneWallet) {
          const address = this.hmy.wallet.accounts[0];
          hmyAddrHex = this.hmy.crypto.getAddress(address).checksum;
        }

        let res = await hmyTokenContract.methods
          .isApprovedForAll(hmyAddrHex, this.hmyManagerContract.address)
          .call(this.options);

        if (!res) {
          res = await hmyTokenContract.methods
            .setApprovalForAll(this.hmyManagerContract.address, true)
            .send(this.options)
            .on('transactionHash', sendTxCallback);

          resolve(res);
        } else {
          sendTxCallback('skip');
          resolve(res);
        }
      } catch (e) {
        reject(e);
      }
    });
  };

  burnTokens = async (
    hrc20Address: string,
    userAddr: string,
    amount: number | number[],
    sendTxCallback?: (hash: string) => void
  ) => {
    return new Promise(async (resolve, reject) => {
      try {
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

        const userAddrHex = this.hmy.crypto.getAddress(userAddr).checksum;

        const response = await this.hmyManagerContract.methods
          .burnTokens(hrc20Address, amount, userAddrHex)
          .send(this.options)
          .on('transactionHash', sendTxCallback);

        resolve(response);
      } catch (e) {
        reject(e);
      }
    });
  };
}
