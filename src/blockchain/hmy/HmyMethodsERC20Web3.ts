import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { withDecimals } from '../utils';
import MyERC20Abi from '../out/MyERC20';
import { getAddress } from '@harmony-js/crypto';
const BN = require('bn.js');

interface IHmyMethodsInitParams {
  hmy: Web3;
  hmyManagerContract: Contract;
  hmyManagerContractAddress: string;
  options?: { gasPrice: number; gasLimit: number };
}

export class HmyMethodsERC20Web3 {
  private hmy: Web3;
  private hmyManagerContract: Contract;
  private hmyManagerContractAddress: string;
  // private options = { gasPrice: 1000000000, gasLimit: 6721900 };
  private useMetamask = false;

  constructor(params: IHmyMethodsInitParams) {
    this.hmy = params.hmy;
    this.hmyManagerContract = params.hmyManagerContract;
    this.hmyManagerContractAddress = params.hmyManagerContractAddress;

    // if (params.options) {
    //   this.options = params.options;
    // }
  }

  setUseOneWallet = (value: boolean) => value;
  setUseMathWallet = (value: boolean) => value;
  setUseMetamask = (value: boolean) => (this.useMetamask = value);

  approveHmyManger = async (
    hrc20Address: string,
    amount: number,
    decimals: number,
    sendTxCallback?: (hash: string) => void
  ) => {
    const hmyTokenContract = new this.hmy.eth.Contract(MyERC20Abi, hrc20Address);

    let accounts;
    if (this.useMetamask) {
      // @ts-ignore
      accounts = await ethereum.enable();
    }

    const res = await hmyTokenContract.methods
      .approve(this.hmyManagerContractAddress, withDecimals(amount, decimals))
      .send({
        from: this.useMetamask ? accounts[0] : this.hmy.eth.defaultAccount,
        gasLimit: 6721900,
        gasPrice: new BN(await this.hmy.eth.getGasPrice()).mul(new BN(1)),
      })
      .on('transactionHash', sendTxCallback);

    return res;
  };

  burnToken = async (
    hrc20Address: string,
    userAddr: string,
    amount: number,
    decimals: number,
    sendTxCallback?: (hash: string) => void
  ) => {
    let accounts;
    if (this.useMetamask) {
      // @ts-ignore
      accounts = await ethereum.enable();
    }

    const userAddrHex = getAddress(userAddr).checksum;

    const response = await this.hmyManagerContract.methods
      .burnToken(hrc20Address, withDecimals(amount, decimals), userAddrHex)
      .send({
        from: this.useMetamask ? accounts[0] : this.hmy.eth.defaultAccount,
        gasLimit: 6721900,
        gasPrice: new BN(await this.hmy.eth.getGasPrice()).mul(new BN(1)),
      })
      .on('transactionHash', sendTxCallback);

    return response;
  };

  getMappingFor = async (erc20TokenAddr: string) => {
    const res = await this.hmyManagerContract.methods.mappings(erc20TokenAddr).call();

    return res;
  };

  checkHmyBalance = async (hrc20Address: string, addr: string) => {
    const hmyTokenContract = new this.hmy.eth.Contract(MyERC20Abi, hrc20Address);

    const addrHex = getAddress(addr).checksum;

    return await hmyTokenContract.methods.balanceOf(addrHex).call();
  };

  totalSupply = async (hrc20Address: string) => {
    const hmyTokenContract = new this.hmy.eth.Contract(MyERC20Abi, hrc20Address);

    return await hmyTokenContract.methods.totalSupply().call();
  };

  setApprovalForAll = async (hrc20Address: string, sendTxCallback?: (hash: string) => void) => {
    const hmyTokenContract = new this.hmy.eth.Contract(MyERC20Abi, hrc20Address);

    let accounts;
    if (this.useMetamask) {
      // @ts-ignore
      accounts = await ethereum.enable();
    }

    let res = await hmyTokenContract.methods
      .isApprovedForAll(
        this.useMetamask ? accounts[0] : this.hmy.eth.defaultAccount,
        this.hmyManagerContractAddress
      )
      .call({
        from: this.useMetamask ? accounts[0] : this.hmy.eth.defaultAccount,
        gasLimit: 6721900,
        gasPrice: new BN(await this.hmy.eth.getGasPrice()).mul(new BN(1)),
      });

    if (!res) {
      res = await hmyTokenContract.methods
        .setApprovalForAll(this.hmyManagerContractAddress, true)
        .send({
          from: this.useMetamask ? accounts[0] : this.hmy.eth.defaultAccount,
          gasLimit: 6721900,
          gasPrice: new BN(await this.hmy.eth.getGasPrice()).mul(new BN(1)),
        })
        .on('transactionHash', sendTxCallback);

      return res;
    } else {
      sendTxCallback('skip');
      return res;
    }
  };

  burnTokens = async (
    hrc20Address: string,
    userAddr: string,
    amount: number | number[],
    sendTxCallback?: (hash: string) => void
  ) => {
    let accounts;

    if (this.useMetamask) {
      // @ts-ignore
      accounts = await ethereum.enable();
    }

    const userAddrHex = getAddress(userAddr).checksum;

    const response = await this.hmyManagerContract.methods
      .burnTokens(hrc20Address, amount, userAddrHex)
      .send({
        from: this.useMetamask ? accounts[0] : this.hmy.eth.defaultAccount,
        gasLimit: 6721900,
        gasPrice: new BN(await this.hmy.eth.getGasPrice()).mul(new BN(1)),
      })
      .on('transactionHash', sendTxCallback);

    return response;
  };
}
