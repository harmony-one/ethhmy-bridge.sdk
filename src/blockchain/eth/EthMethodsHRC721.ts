import { Contract } from 'web3-eth-contract';
import { getAddress } from '@harmony-js/crypto';
import Web3 from 'web3';
import { getGasPrice } from './helpers';
import MyERC721Abi from '../out/MyERC721';
const BN = require('bn.js');

export interface IEthMethodsInitParams {
  web3: Web3;
  ethManagerContract: Contract;
  ethManagerAddress: string;
  ethTokenManagerAddress: string;
  gasPrice: number;
  gasLimit: number;
}

export class EthMethodsHRC721 {
  private web3: Web3;
  private ethManagerContract: Contract;
  private ethManagerAddress: string;
  private ethTokenManagerAddress: string;
  private gasPrice?: number;
  private gasLimit?: number;

  private useMetamask = false;

  constructor(params: IEthMethodsInitParams) {
    this.web3 = params.web3;
    this.ethManagerContract = params.ethManagerContract;
    this.ethManagerAddress = params.ethManagerAddress;
    this.ethTokenManagerAddress = params.ethTokenManagerAddress;
    this.gasPrice = params.gasPrice;
    this.gasLimit = params.gasLimit;
  }

  setUseMetamask = (value: boolean) => (this.useMetamask = value);

  approveEthManger = async (erc721Address: string, sendTxCallback?: (address: string) => void) => {
    let accounts;

    if (this.useMetamask) {
      // @ts-ignore
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    }

    const erc721Contract = new this.web3.eth.Contract(MyERC721Abi, erc721Address);

    return await erc721Contract.methods
      .setApprovalForAll(this.ethManagerAddress, true)
      .send({
        from: this.useMetamask ? accounts[0] : this.web3.eth.defaultAccount,
        gas: this.gasLimit,
        gasPrice: new BN(await this.web3.eth.getGasPrice()).mul(new BN(1)),
      })
      .on('transactionHash', (hash: string) => sendTxCallback(hash));
  };

  burnToken = async (
    hrc721Address: string,
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
    const hrc721AddressHex = getAddress(hrc721Address).checksum;

    const estimateGas = await this.ethManagerContract.methods
      .burnTokens(hrc721AddressHex, amount, hmyAddrHex)
      .estimateGas({ from: this.useMetamask ? accounts[0] : this.web3.eth.defaultAccount });

    const gasLimit = Math.max(estimateGas + estimateGas * 0.3, Number(this.gasLimit));
    const transaction = await this.ethManagerContract.methods
      .burnTokens(hrc721AddressHex, amount, hmyAddrHex)
      .send({
        from: this.useMetamask ? accounts[0] : this.web3.eth.defaultAccount,
        gas: new BN(gasLimit),
        gasPrice: this.gasPrice ? this.gasPrice : await getGasPrice(this.web3),
      })
      .on('transactionHash', (hash: string) => sendTxCallback(hash));

    return transaction.events.Locked;
  };

  checkEthBalance = async (erc721Address: string, addr: string) => {
    const erc721Contract = new this.web3.eth.Contract(MyERC721Abi, erc721Address);

    return await erc721Contract.methods.balanceOf(addr).call();
  };

  tokenDetails = async (erc721Address: string) => {
    if (!this.web3.utils.isAddress(erc721Address)) {
      throw new Error('Invalid token address');
    }

    const erc721Contract = new this.web3.eth.Contract(MyERC721Abi, erc721Address);

    const name = await erc721Contract.methods.name().call();
    const symbol = await erc721Contract.methods.symbol().call();
    const decimals = await erc721Contract.methods.decimals().call();

    return { name, symbol, decimals, erc721Address };
  };

  getMappingFor = async (erc721TokenAddr: string, withoutFormat = false) => {
    const hmyAddrHex = withoutFormat ? erc721TokenAddr : getAddress(erc721TokenAddr).checksum;

    if (!this.web3.utils.isAddress(hmyAddrHex)) {
      throw new Error('Invalid token address');
    }

    const TokenManagerJson = require('../out/NFTTokenManager');

    const tokenManager = new this.web3.eth.Contract(
      TokenManagerJson.abi,
      this.ethTokenManagerAddress
    );

    return await tokenManager.methods.mappedTokens(hmyAddrHex).call();
  };

  totalSupply = async (hrc721Address: string) => {
    const erc721Contract = new this.web3.eth.Contract(MyERC721Abi, hrc721Address);

    return await erc721Contract.methods.totalSupply().call();
  };

  allowance = async (addr: string, erc721Address: string) => {
    if (!this.web3.utils.isAddress(erc721Address)) {
      throw new Error('Invalid token address');
    }

    const erc721Contract = new this.web3.eth.Contract(MyERC721Abi, erc721Address);

    return await erc721Contract.methods.allowance(addr, this.ethManagerAddress).call();
  };
}
