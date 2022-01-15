import { Contract } from 'web3-eth-contract';
import { getAddress } from '@harmony-js/crypto';
import Web3 from 'web3';
import { getGasPrice } from './helpers';
import MyERC1155Abi from '../out/MyERC1155';

const BN = require('bn.js');

export interface IEthMethodsInitParams {
  web3: Web3;
  ethManagerContract: Contract;
  ethManagerAddress: string;
  ethTokenManagerAddress: string;
  gasPrice: number;
  gasLimit: number;
}

export class EthMethodsHRC1155 {
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

  approveEthManger = async (erc1155Address: string, sendTxCallback?: (address: string) => void) => {
    let accounts;

    if (this.useMetamask) {
      // @ts-ignore
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    }

    const erc1155Contract = new this.web3.eth.Contract(MyERC1155Abi, erc1155Address);

    await erc1155Contract.methods
      .setApprovalForAll(this.ethManagerAddress, true)
      .send({
        from: this.useMetamask ? accounts[0] : this.web3.eth.defaultAccount,
        gas: this.gasLimit,
        gasPrice: await getGasPrice(this.web3),
      })
      .on('transactionHash', (hash: string) => sendTxCallback(hash));
  };

  burnToken = async (
    hrc1155Address: string,
    userAddr: string,
    tokenIds: number[],
    amounts: number[],
    sendTxCallback?: (addr: string) => void
  ) => {
    let accounts;

    if (this.useMetamask) {
      // @ts-ignore
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    }

    const hmyAddrHex = getAddress(userAddr).checksum;
    const hrc1155AddressHex = getAddress(hrc1155Address).checksum;

    let estimateGas = 0;
    try {
      estimateGas = await this.ethManagerContract.methods
        .burnTokens(hrc1155AddressHex, tokenIds, hmyAddrHex, amounts)
        .estimateGas({ from: this.useMetamask ? accounts[0] : this.web3.eth.defaultAccount });
    } catch (e) {}

    const gasLimit = Math.max(estimateGas + estimateGas * 0.3, Number(process.env.ETH_GAS_LIMIT));
    const transaction = await this.ethManagerContract.methods
      .burnTokens(hrc1155AddressHex, tokenIds, hmyAddrHex, amounts)
      .send({
        from: this.useMetamask ? accounts[0] : this.web3.eth.defaultAccount,
        gas: new BN(gasLimit),
        gasPrice: this.gasPrice ? this.gasPrice : await getGasPrice(this.web3),
      })
      .on('transactionHash', (hash: string) => sendTxCallback(hash));

    return transaction.events.Locked;
  };

  checkEthBalance = async (erc1155Address: string, addr: string) => {
    const erc1155Contract = new this.web3.eth.Contract(MyERC1155Abi, erc1155Address);

    return await erc1155Contract.methods.balanceOf(addr).call();
  };

  tokenDetails = async (erc1155Address: string) => {
    if (!this.web3.utils.isAddress(erc1155Address)) {
      throw new Error('Invalid token address');
    }

    const erc1155Contract = new this.web3.eth.Contract(MyERC1155Abi, erc1155Address);

    const name = await erc1155Contract.methods.name().call();
    const symbol = await erc1155Contract.methods.symbol().call();
    const decimals = await erc1155Contract.methods.decimals().call();

    return { name, symbol, decimals, erc1155Address };
  };

  getMappingFor = async (erc1155TokenAddr: string, withoutFormat = false) => {
    const hmyAddrHex = withoutFormat ? erc1155TokenAddr : getAddress(erc1155TokenAddr).checksum;

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

  balanceOf = async (erc1155Address: string, tokenId: string) => {
    let accounts;

    if (this.useMetamask) {
      // @ts-ignore
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    }

    const account = this.useMetamask ? accounts[0] : this.web3.eth.defaultAccount;
    const erc1155Contract = new this.web3.eth.Contract(MyERC1155Abi, erc1155Address);

    return await erc1155Contract.methods.balanceOf(account, tokenId).call();
  };

  totalSupply = async (hrc1155Address: string) => {
    const erc1155Contract = new this.web3.eth.Contract(MyERC1155Abi, hrc1155Address);

    return await erc1155Contract.methods.totalSupply().call();
  };

  allowance = async (addr: string, erc1155Address: string) => {
    if (!this.web3.utils.isAddress(erc1155Address)) {
      throw new Error('Invalid token address');
    }
    const erc1155Contract = new this.web3.eth.Contract(MyERC1155Abi, erc1155Address);

    return await erc1155Contract.methods.allowance(addr, this.ethManagerAddress).call();
  };
}
