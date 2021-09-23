import { mulDecimals } from '../../utils';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { getAddress } from '@harmony-js/crypto';
import tokenJsonAbi from '../out/MyERC20';
const BN = require('bn.js');

interface IHmyMethodsInitParams {
  hmy: Web3;
  hmyManagerContract: Contract;
  hmyManagerContractAddress: string;
  options?: { gasPrice: number; gasLimit: number };
}

export class HmyMethodsHRC20Web3 {
  private web3: Web3;
  private hmyManagerContract: Contract;
  private hmyManagerContractAddress: string;
  // private options = { gasPrice: 3000000000, gasLimit: 6721900 };

  private useMetamask = false;

  constructor(params: IHmyMethodsInitParams) {
    this.web3 = params.hmy;
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
    sendTxCallback?: (addr: string) => void
  ) => {
    const hmyTokenContract = new this.web3.eth.Contract(tokenJsonAbi, hrc20Address);

    let accounts;
    if (this.useMetamask) {
      // @ts-ignore
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    }

    if (Number(amount) === 0) {
      sendTxCallback('skip');
      return;
    }

    const res = await hmyTokenContract.methods
      .approve(this.hmyManagerContractAddress, mulDecimals(amount, decimals))
      .send({
        from: this.useMetamask ? accounts[0] : this.web3.eth.defaultAccount,
        gasLimit: 6721900,
        gasPrice: new BN(await this.web3.eth.getGasPrice()).mul(new BN(1)),
      })
      .on('transactionHash', sendTxCallback);

    return res;
  };

  checkHmyBalance = async (hrc20Address: string, addr: string) => {
    const hmyTokenContract = new this.web3.eth.Contract(tokenJsonAbi, hrc20Address);

    const addrHex = getAddress(addr).checksum;

    return await hmyTokenContract.methods.balanceOf(addrHex).call();
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
    let accounts;
    if (this.useMetamask) {
      // @ts-ignore
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    }

    const hmyAddrHex = getAddress(userAddr).checksum;

    const res = await this.hmyManagerContract.methods
      .lockToken(erc20Address, mulDecimals(amount, decimals), hmyAddrHex)
      .send({
        from: this.useMetamask ? accounts[0] : this.web3.eth.defaultAccount,
        gasLimit: 6721900,
        gasPrice: new BN(await this.web3.eth.getGasPrice()).mul(new BN(1)),
      })
      .on('transactionHash', sendTxCallback);

    return res;
  };

  lockOne = async (userAddr: string, amount: number, sendTxCallback?: (addr: string) => void) => {
    let accounts;
    if (this.useMetamask) {
      // @ts-ignore
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    }

    const hmyAddrHex = getAddress(userAddr).checksum;

    const res = await this.hmyManagerContract.methods
      .lockOne(mulDecimals(amount, 18), hmyAddrHex)
      .send({
        from: this.useMetamask ? accounts[0] : this.web3.eth.defaultAccount,
        gasLimit: 6721900,
        gasPrice: new BN(await this.web3.eth.getGasPrice()).mul(new BN(1)),
        value: mulDecimals(amount, 18),
      })
      .on('transactionHash', sendTxCallback);

    return res;
  };

  tokenDetails = async (erc20Address: string) => {
    const erc20Contract = new this.web3.eth.Contract(tokenJsonAbi, erc20Address);

    const name = await erc20Contract.methods.name().call();
    const symbol = await erc20Contract.methods.symbol().call();
    const decimals = await erc20Contract.methods.decimals().call();

    return {
      name,
      symbol,
      decimals: Number(decimals).toString(),
      erc20Address,
    };
  };

  allowance = async (addr: string, erc20Address: string) => {
    const addrHex = getAddress(addr).checksum;

    const hmyTokenContract = new this.web3.eth.Contract(tokenJsonAbi, erc20Address);

    return await hmyTokenContract.methods.allowance(addrHex, this.hmyManagerContractAddress).call();
  };

  lockOneBSC = async (
    userAddr: string,
    amount: number,
    sendTxCallback?: (addr: string) => void
  ) => {
    let accounts;
    if (this.useMetamask) {
      // @ts-ignore
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    }

    const hmyAddrHex = getAddress(userAddr).checksum;

    const managerContract = new this.web3.eth.Contract(
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
      this.hmyManagerContractAddress
    );

    const res = await managerContract.methods
      .lockNative(mulDecimals(amount, 18), hmyAddrHex)
      .send({
        from: this.useMetamask ? accounts[0] : this.web3.eth.defaultAccount,
        gasLimit: 6721900,
        gasPrice: new BN(await this.web3.eth.getGasPrice()).mul(new BN(1)),
        value: mulDecimals(amount, 18),
      })
      .on('transactionHash', sendTxCallback);

    return res;
  };
}
