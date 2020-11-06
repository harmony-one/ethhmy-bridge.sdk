import { Harmony } from '@harmony-js/core';
import { Contract } from '@harmony-js/contract';
import { withDecimals } from '../utils';
import MyERC20Abi from '../out/MyERC20';

interface IHmyMethodsInitParams {
  hmy: Harmony;
  hmyManagerContract: Contract;
  options?: { gasPrice: number; gasLimit: number };
}

export class HmyMethodsERC20 {
  private hmy: Harmony;
  private hmyManagerContract: Contract;
  private options = { gasPrice: 1000000000, gasLimit: 6721900 };

  constructor(params: IHmyMethodsInitParams) {
    this.hmy = params.hmy;
    this.hmyManagerContract = params.hmyManagerContract;

    if (params.options) {
      this.options = params.options;
    }
  }

  approveHmyManger = (
    hrc20Address: string,
    amount: number,
    decimals: number,
    sendTxCallback?: (hash: string) => void
  ) => {
    const tokenJson = require('../out/MyERC20.json');
    const hmyTokenContract = this.hmy.contracts.createContract(tokenJson.abi, hrc20Address);

    return new Promise(async (resolve, reject) => {
      try {
        // TODO
        // await connectToOneWallet(hmyTokenContract.wallet, null, reject);

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
        // await connectToOneWallet(this.hmyManagerContract.wallet, null, reject);

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
}
