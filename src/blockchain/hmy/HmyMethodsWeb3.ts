import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { withDecimals } from '../utils';
import { getAddress } from '@harmony-js/crypto';
const BN = require('bn.js');

interface IHmyMethodsInitParams {
  hmy: Web3;
  hmyTokenContract: Contract;
  hmyManagerContract: Contract;
  hmyManagerContractAddress: string;
  options?: { gasPrice: number; gasLimit: number };
}

export class HmyMethodsWeb3 {
  public web3: Web3;
  public hmyTokenContract: Contract;
  public hmyManagerContract: Contract;
  public hmyManagerContractAddress: string;
  // private options = { gasPrice: 30000000000, gasLimit: 6721900 };
  public useMetamask = false;

  constructor(params: IHmyMethodsInitParams) {
    this.web3 = params.hmy;
    this.hmyTokenContract = params.hmyTokenContract;
    this.hmyManagerContract = params.hmyManagerContract;
    this.hmyManagerContractAddress = params.hmyManagerContractAddress;

    // if (params.options) {
    //   this.options = params.options;
    // }
  }

  setUseOneWallet = (value: boolean) => value;
  setUseMathWallet = (value: boolean) => value;

  setUseMetamask = (value: boolean) => (this.useMetamask = value);

  approveHmyManger = async (amount: number, sendTxCallback?: (hash: string) => void) => {
    let accounts;
    if (this.useMetamask) {
      // @ts-ignore
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    }

    const transaction = await this.hmyTokenContract.methods
      .approve(this.hmyManagerContractAddress, withDecimals(amount, 18))
      .send({
        from: this.useMetamask ? accounts[0] : this.web3.eth.defaultAccount,
        gasLimit: 6721900,
        gasPrice: new BN(await this.web3.eth.getGasPrice()).mul(new BN(1)),
      })
      .on('transactionHash', sendTxCallback);

    return transaction;
  };

  burnToken = async (userAddr: string, amount: number, sendTxCallback?: (hash: string) => void) => {
    let accounts;
    if (this.useMetamask) {
      // @ts-ignore
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    }

    const userAddrHex = getAddress(userAddr).checksum;

    const transaction = await this.hmyManagerContract.methods
      .burnToken(withDecimals(amount, 18), userAddrHex)
      .send({
        from: this.useMetamask ? accounts[0] : this.web3.eth.defaultAccount,
        gasLimit: 6721900,
        gasPrice: new BN(await this.web3.eth.getGasPrice()).mul(new BN(1)),
      })
      .on('transactionHash', sendTxCallback);

    return transaction;
  };

  checkHmyBalance = async (addr: string) => {
    return await this.hmyTokenContract.methods.balanceOf(getAddress(addr).checksum).call();
  };

  totalSupply = async () => {
    return await this.hmyTokenContract.methods.totalSupply().call();
  };
}
