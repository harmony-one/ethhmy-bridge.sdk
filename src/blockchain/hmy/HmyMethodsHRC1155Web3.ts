import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { getAddress } from '@harmony-js/crypto';
import MyERC1155Abi from '../out/MyERC1155';

const BN = require('bn.js');

interface IHmyMethodsInitParams {
  web3: Web3;
  hmyManagerContract: Contract;
  hmyManagerContractAddress: string;
  options?: { gasPrice: number; gasLimit: number };
}

export class HmyMethodsHRC1155Web3 {
  private web3: Web3;
  private hmyManagerContract: Contract;
  private hmyManagerContractAddress: string;
  private gasLimit: number;
  private useMetamask = false;

  constructor(params: IHmyMethodsInitParams) {
    this.web3 = params.web3;
    this.hmyManagerContract = params.hmyManagerContract;
    this.hmyManagerContractAddress = params.hmyManagerContractAddress;
    this.gasLimit = params.options.gasLimit;
  }

  setUseOneWallet = (value: boolean) => value;
  setUseMathWallet = (value: boolean) => value;
  setUseMetamask = (value: boolean) => (this.useMetamask = value);

  approveHmyManger = async (
    hrc1155Address: string,
    sendTxCallback?: (addr: string) => void,
  ) => {
    const hmyTokenContract = new this.web3.eth.Contract(
      MyERC1155Abi,
      hrc1155Address,
    );

    let accounts;
    if (this.useMetamask) {
      // @ts-ignore
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    }

    return await hmyTokenContract.methods
      .setApprovalForAll(this.hmyManagerContractAddress, true)
      .send({
        from: this.useMetamask ? accounts[0] : this.web3.eth.defaultAccount,
        gas: this.gasLimit,
        gasPrice: new BN(await this.web3.eth.getGasPrice()).mul(new BN(1)),
      })
      .on('transactionHash', sendTxCallback);
  };

  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////

  lockTokens = async (
    erc1155Address: string,
    userAddr: string,
    tokenIds: number[],
    amounts: number[],
    sendTxCallback?: (addr: string) => void,
  ) => {
    let accounts;
    if (this.useMetamask) {
      // @ts-ignore
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    }
    const hmyAddrHex = getAddress(userAddr).checksum;

    return await this.hmyManagerContract.methods
      .lockHRC1155Tokens(erc1155Address, tokenIds, hmyAddrHex, amounts, [])
      .send({
        from: this.useMetamask ? accounts[0] : this.web3.eth.defaultAccount,
        gas: this.gasLimit,
        gasPrice: new BN(await this.web3.eth.getGasPrice()).mul(new BN(1)),
      })
      .on('transactionHash', sendTxCallback);
  };

  tokenDetails = async (erc1155Address: string) => {
    const erc1155Contract = new this.web3.eth.Contract(
      MyERC1155Abi,
      erc1155Address,
    );

    const tryOrDefault = async <T>(p: Promise<T>, d: T) => {
      try {
        return await p;
      } catch (e) {
        return d;
      }
    };

    const name = await tryOrDefault(erc1155Contract.methods.name().call(), '');
    const symbol = await tryOrDefault(erc1155Contract.methods.symbol().call(), '');
    const baseURI = await erc1155Contract.methods.uri(0).call();

    return {
      name,
      symbol,
      baseURI,
      erc1155Address,
    };
  };

  balanceOf = async (erc1155Address: string, tokenId: string) => {
    let accounts;
    if (this.useMetamask) {
      // @ts-ignore
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    }
    const erc721Contract = new this.web3.eth.Contract(
      MyERC1155Abi,
      erc1155Address,
    );
    const account = this.useMetamask ? accounts[0] : this.web3.eth.defaultAccount;

    return await erc721Contract.methods.balanceOf(account, tokenId).call();
  };

  allowance = async (addr: string, erc1155Address: string) => {
    const addrHex = getAddress(addr).checksum;
    const hmyTokenContract = new this.web3.eth.Contract(
      MyERC1155Abi,
      erc1155Address,
    );

    return await hmyTokenContract.methods
      .allowance(addrHex, this.hmyManagerContractAddress)
      .call();
  };
}
