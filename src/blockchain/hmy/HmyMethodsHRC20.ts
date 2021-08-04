import { Harmony } from '@harmony-js/core';
import { Contract } from '@harmony-js/contract';
import { connectToBrowserWallet } from './helpers';
import { mulDecimals } from '../../utils';
import { getAddress } from '@harmony-js/crypto';
import tokenJsonAbi from '../out/MyERC20';
import { withDecimals } from '../utils';

interface IHmyMethodsInitParams {
  hmy: Harmony;
  hmyManagerContract: Contract;
  options?: { gasPrice: number; gasLimit: number };
}

export class HmyMethodsHRC20 {
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
    sendTxCallback?: (addr: string) => void
  ) => {
    const hmyTokenContract = this.hmy.contracts.createContract(tokenJsonAbi, hrc20Address);

    return new Promise(async (resolve, reject) => {
      try {
        if (Number(amount) === 0) {
          sendTxCallback('skip');
          return resolve();
        }

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
          .approve(this.hmyManagerContract.address, mulDecimals(amount, decimals))
          .send(this.options)
          .on('transactionHash', sendTxCallback);

        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  };

  checkHmyBalance = async (hrc20Address: string, addr: string) => {
    const hmyTokenContract = this.hmy.contracts.createContract(tokenJsonAbi, hrc20Address);

    const addrHex = this.hmy.crypto.getAddress(addr).checksum;

    return await hmyTokenContract.methods.balanceOf(addrHex).call(this.options);
  };

  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////

  lockToken = async (
    erc20Address: string,
    userAddr: string,
    amount: number,
    decimals: number,
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
          .lockToken(erc20Address, mulDecimals(amount, decimals), hmyAddrHex)
          .send(this.options)
          .on('transactionHash', sendTxCallback);

        // return transaction.events.Locked;

        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  };

  lockOne = async (userAddr: string, amount: number, sendTxCallback?: (addr: string) => void) => {
    return new Promise(async (resolve, reject) => {
      try {
        // TODO
        const hmyAddrHex = getAddress(userAddr).checksum;

        // await connectToOneWallet(this.hmyManagerContract.wallet, null, reject);

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
          .lockOne(mulDecimals(amount, 18), hmyAddrHex)
          .send({ ...this.options, value: mulDecimals(amount, 18) })
          .on('transactionHash', sendTxCallback);

        // return transaction.events.Locked;

        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  };

  tokenDetails = async (erc20Address: string) => {
    const erc20Contract = this.hmy.contracts.createContract(tokenJsonAbi, erc20Address);

    const name = await erc20Contract.methods.name().call(this.options);
    const symbol = await erc20Contract.methods.symbol().call(this.options);
    const decimals = await erc20Contract.methods.decimals().call(this.options);

    return { name, symbol, decimals: Number('0x' + decimals).toString(), erc20Address };
  };

  allowance = async (addr: string, erc20Address: string) => {
    const hmyTokenContract = this.hmy.contracts.createContract(tokenJsonAbi, erc20Address);

    const addrHex = this.hmy.crypto.getAddress(addr).checksum;

    return await hmyTokenContract.methods
      .allowance(addrHex, this.hmyManagerContract.address)
      .call(this.options);
  };

  lockOneBSC = async (
    userAddr: string,
    amount: number,
    sendTxCallback?: (addr: string) => void
  ) => {
    return new Promise(async (resolve, reject) => {
      try {
        // TODO
        const hmyAddrHex = this.hmy.crypto.getAddress(userAddr).checksum;

        const managerContract = this.hmy.contracts.createContract(
          [
            {
              constant: false,
              inputs: [
                {
                  internalType: 'uint256',
                  name: 'amount',
                  type: 'uint256',
                },
                {
                  internalType: 'address',
                  name: 'recipient',
                  type: 'address',
                },
              ],
              name: 'lockNative',
              outputs: [],
              payable: true,
              stateMutability: 'payable',
              type: 'function',
            },
          ],
          this.hmyManagerContract.address
        );

        if (this.useOneWallet) {
          await connectToBrowserWallet(
            // @ts-ignore
            window.onewallet,
            this.hmy,
            managerContract.wallet,
            null,
            reject
          );
        }

        if (this.useMathWallet) {
          await connectToBrowserWallet(
            // @ts-ignore
            window.harmony,
            this.hmy,
            managerContract.wallet,
            null,
            reject
          );
        }

        const res = await managerContract.methods
          .lockNative(withDecimals(amount, 18), hmyAddrHex)
          .send({ ...this.options, value: withDecimals(amount, 18) })
          .on('transactionHash', sendTxCallback);

        // return transaction.events.Locked;

        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  };
}
