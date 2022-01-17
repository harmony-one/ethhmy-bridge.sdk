import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { getAddress } from '@harmony-js/crypto';
import MyERC721Abi from '../out/MyERC721';

const BN = require('bn.js');

interface IHmyMethodsInitParams {
  web3: Web3;
  hmyManagerContract: Contract;
  hmyManagerContractAddress: string;
  options?: { gasPrice: number; gasLimit: number };
}

export class HmyMethodsHRC721Web3 {
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
    hrc721Address: string,
    sendTxCallback?: (addr: string) => void,
  ) => {
    const hmyTokenContract = new this.web3.eth.Contract(
      MyERC721Abi,
      hrc721Address,
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
    erc721Address: string,
    userAddr: string,
    tokenIds: number[],
    sendTxCallback?: (addr: string) => void,
  ) => {
    let accounts;
    if (this.useMetamask) {
      // @ts-ignore
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    }

    const hmyAddrHex = getAddress(userAddr).checksum;

    return await this.hmyManagerContract.methods
      .lockTokens(erc721Address, tokenIds, hmyAddrHex)
      .send({
        from: this.useMetamask ? accounts[0] : this.web3.eth.defaultAccount,
        gasLimit: this.gasLimit,
        gasPrice: new BN(await this.web3.eth.getGasPrice()).mul(new BN(1)),
      })
      .on('transactionHash', sendTxCallback);
  };

  tokenDetails = async (erc721Address: string) => {
    const erc721Contract = new this.web3.eth.Contract(
      MyERC721Abi,
      erc721Address,
    );

    const name = await erc721Contract.methods.name().call();
    const symbol = await erc721Contract.methods.symbol().call();
    const baseURI = await erc721Contract.methods.baseURI().call();

    return {
      name,
      symbol,
      baseURI,
      erc721Address,
    };
  };

  balanceOf = async (erc721Address: string) => {
    let accounts;
    if (this.useMetamask) {
      // @ts-ignore
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    }

    const erc721Contract = new this.web3.eth.Contract(
      MyERC721Abi,
      erc721Address,
    );
    const account = this.useMetamask ? accounts[0] : this.web3.eth.defaultAccount;

    return await erc721Contract.methods.balanceOf(account).call();
  };

  allowance = async (addr: string, erc721Address: string) => {
    const addrHex = getAddress(addr).checksum;

    const hmyTokenContract = new this.web3.eth.Contract(
      MyERC721Abi,
      erc721Address,
    );

    return await hmyTokenContract.methods
      .allowance(addrHex, this.hmyManagerContractAddress)
      .call();
  };
}
