import { Contract } from 'web3-eth-contract';
import { getAddress } from '@harmony-js/crypto';
import Web3 from 'web3';
import { mulDecimals } from '../../utils';
import { getGasPrice } from './helpers';
import MyERC20JsonAbi from '../out/MyERC20';
import { abi as TokenManagerJsonAbi } from '../out/TokenManager';

const BN = require('bn.js');

export interface IEthMethodsInitParams {
  web3: Web3;
  ethManagerContract: Contract;
  ethManagerAddress: string;
  ethTokenManagerAddress: string;
  gasPrice: number;
  gasLimit: number;
  gasApiKey: string;
}

export class EthMethodsHRC20 {
  private web3: Web3;
  private ethManagerContract: Contract;
  private ethManagerAddress: string;
  private ethTokenManagerAddress: string;

  private useMetamask = false;

  gasPrice?: number;
  gasLimit?: number;
  gasApiKey: string;

  constructor(params: IEthMethodsInitParams) {
    this.web3 = params.web3;
    this.ethManagerContract = params.ethManagerContract;
    this.ethManagerAddress = params.ethManagerAddress;
    this.ethTokenManagerAddress = params.ethTokenManagerAddress;

    this.gasPrice = params.gasPrice;
    this.gasLimit = params.gasLimit;
    this.gasApiKey = params.gasApiKey;
  }

  setUseMetamask = (value: boolean) => (this.useMetamask = value);

  approveEthManger = async (
    erc20Address: string,
    amount: number,
    decimals: number,
    sendTxCallback?: (address: string) => void
  ) => {
    let accounts;

    if (this.useMetamask) {
      // @ts-ignore
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    }

    if (Number(amount) === 0) {
      sendTxCallback('skip');
      return;
    }

    const erc20Contract = new this.web3.eth.Contract(MyERC20JsonAbi, erc20Address);

    return await erc20Contract.methods
      .approve(this.ethManagerAddress, mulDecimals(amount, decimals))
      .send({
        from: this.useMetamask ? accounts[0] : this.web3.eth.defaultAccount,
        gas: this.gasLimit,
        gasPrice: new BN(await this.web3.eth.getGasPrice()).mul(new BN(1)),
      })
      .on('transactionHash', (hash: string) => sendTxCallback(hash));
  };

  burnToken = async (
    hrc20Address: string,
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
    const hrc20AddressHex = getAddress(hrc20Address).checksum;

    const estimateGas = await this.ethManagerContract.methods
      .burnToken(hrc20AddressHex, mulDecimals(amount, decimals), hmyAddrHex)
      .estimateGas({ from: this.useMetamask ? accounts[0] : this.web3.eth.defaultAccount });

    const gasLimit = Math.max(estimateGas + estimateGas * 0.3, Number(this.gasLimit));

    const transaction: any = await this.ethManagerContract.methods
      .burnToken(hrc20AddressHex, mulDecimals(amount, decimals), hmyAddrHex)
      .send({
        from: this.useMetamask ? accounts[0] : this.web3.eth.defaultAccount,
        gas: new BN(gasLimit),
        gasPrice: this.gasPrice ? this.gasPrice : await getGasPrice(this.web3),
      })
      .on('transactionHash', (hash: string) => sendTxCallback(hash));

    return transaction.events.Locked;
  };

  checkEthBalance = async (erc20Address: string, addr: string) => {
    const erc20Contract = new this.web3.eth.Contract(MyERC20JsonAbi, erc20Address);

    return await erc20Contract.methods.balanceOf(addr).call();
  };

  tokenDetails = async (erc20Address: string) => {
    if (!this.web3.utils.isAddress(erc20Address)) {
      throw new Error('Invalid token address');
    }

    const erc20Contract = new this.web3.eth.Contract(MyERC20JsonAbi, erc20Address);

    const name = await erc20Contract.methods.name().call();
    const symbol = await erc20Contract.methods.symbol().call();
    const decimals = await erc20Contract.methods.decimals().call();

    return { name, symbol, decimals, erc20Address };
  };

  getMappingFor = async (erc20TokenAddr: string, withoutFormat = false) => {
    const hmyAddrHex = withoutFormat ? erc20TokenAddr : getAddress(erc20TokenAddr).checksum;

    if (!this.web3.utils.isAddress(hmyAddrHex)) {
      throw new Error('Invalid token address');
    }

    const tokenManager = new this.web3.eth.Contract(
      TokenManagerJsonAbi,
      this.ethTokenManagerAddress
    );

    return await tokenManager.methods.mappedTokens(hmyAddrHex).call();
    // const res = await this.ethManagerContract.methods.mappings(hmyAddrHex).call();
    //
    // return res;
  };

  totalSupply = async (hrc20Address: string) => {
    const erc20Contract = new this.web3.eth.Contract(MyERC20JsonAbi, hrc20Address);

    return await erc20Contract.methods.totalSupply().call();
  };

  allowance = async (addr: string, erc20Address: string) => {
    if (!this.web3.utils.isAddress(erc20Address)) {
      throw new Error('Invalid token address');
    }

    const erc20Contract = new this.web3.eth.Contract(MyERC20JsonAbi, erc20Address);

    return await erc20Contract.methods.allowance(addr, this.ethManagerAddress).call();
  };
}
