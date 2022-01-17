import { Contract } from 'web3-eth-contract';
import { getAddress } from '@harmony-js/crypto';
import Web3 from 'web3';

import { mulDecimals } from '../../utils';
import MyERC1155Abi from '../out/MyERC1155';

const BN = require('bn.js');

export interface IEthMethodsInitParams {
  web3: Web3;
  ethManagerContract: Contract;
  ethManagerAddress: string;
  gasPrice: number;
  gasLimit: number;
}

export class EthMethodsERC1155 {
  private web3: Web3;
  private ethManagerContract: Contract;
  private ethManagerAddress: string;
  private useMetamask = false;
  private gasLimit: number;

  constructor(params: IEthMethodsInitParams) {
    this.web3 = params.web3;
    this.ethManagerContract = params.ethManagerContract;
    this.ethManagerAddress = params.ethManagerAddress;
    this.gasLimit = params.gasLimit;
  }

  setUseMetamask = (value: boolean) => (this.useMetamask = value);

  approveEthManger = async (
    erc1155Address: string,
    amount: number,
    decimals: number,
    sendTxCallback?: (hash: string) => void
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

    const erc1155Contract = new this.web3.eth.Contract(MyERC1155Abi, erc1155Address);

    return await erc1155Contract.methods
      .approve(this.ethManagerAddress, mulDecimals(amount, decimals))
      .send({
        from: this.useMetamask ? accounts[0] : this.web3.eth.defaultAccount,
        gas: this.gasLimit,
        gasPrice: new BN(await this.web3.eth.getGasPrice()).mul(new BN(1)),
      })
      .on('transactionHash', (hash: string) => sendTxCallback(hash));
  };

  balanceOf = async (erc1155Address: string, tokenId: string) => {
    let accounts;
    if (this.useMetamask) {
      // @ts-ignore
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    }
    const erc1155Contract = new this.web3.eth.Contract(MyERC1155Abi, erc1155Address);
    const account = this.useMetamask ? accounts[0] : this.web3.eth.defaultAccount;

    return await erc1155Contract.methods.balanceOf(account, tokenId).call();
  };

  setApprovalForAllEthManger = async (
    erc1155Address: string,
    sendTxCallback?: (hash: string) => void
  ) => {
    let accounts;
    if (this.useMetamask) {
      // @ts-ignore
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    }

    const erc1155Contract = new this.web3.eth.Contract(MyERC1155Abi, erc1155Address);

    return await erc1155Contract.methods
      .setApprovalForAll(this.ethManagerAddress, true)
      .send({
        from: this.useMetamask ? accounts[0] : this.web3.eth.defaultAccount,
        gas: this.gasLimit,
        gasPrice: new BN(await this.web3.eth.getGasPrice()).mul(new BN(1)),
      })
      .on('transactionHash', (hash: string) => sendTxCallback(hash));
  };

  lockTokens = async (
    erc1155Address: string,
    userAddr: string,
    tokenIds: number[],
    amounts: number[],
    sendTxCallback: (hash: string) => void
  ) => {
    let accounts;
    if (this.useMetamask) {
      // @ts-ignore
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    }

    const hmyAddrHex = getAddress(userAddr).checksum;
    const transaction = await this.ethManagerContract.methods
      .lockHRC1155Tokens(erc1155Address, tokenIds, hmyAddrHex, amounts, [])
      .send({
        from: this.useMetamask ? accounts[0] : this.web3.eth.defaultAccount,
        gas: this.gasLimit,
        gasPrice: new BN(await this.web3.eth.getGasPrice()).mul(new BN(1)),
      })
      .on('transactionHash', (hash: string) => sendTxCallback(hash));

    return transaction;
  };

  lockToken = async (
    erc1155Address: string,
    userAddr: string,
    amount: number,
    decimals: number,
    sendTxCallback?: (hash: string) => void
  ) => {
    let accounts;
    if (this.useMetamask) {
      // @ts-ignore
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    }

    const hmyAddrHex = getAddress(userAddr).checksum;
    const transaction = await this.ethManagerContract.methods
      .lockToken(erc1155Address, mulDecimals(amount, decimals), hmyAddrHex)
      .send({
        from: this.useMetamask ? accounts[0] : this.web3.eth.defaultAccount,
        gas: this.gasLimit,
        gasPrice: new BN(await this.web3.eth.getGasPrice()).mul(new BN(1)),
      })
      .on('transactionHash', (hash: string) => sendTxCallback(hash));

    return transaction;
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

    const symbol = await erc1155Contract.methods.symbol().call();

    let name = symbol;
    try {
      name = await erc1155Contract.methods.name().call();
    } catch (e) {}
    const decimals = await erc1155Contract.methods.decimals().call();

    return { name, symbol, decimals, erc1155Address };
  };

  tokenDetailsERC1155 = async (erc1155Address: string) => {
    const erc1155Contract = new this.web3.eth.Contract(MyERC1155Abi, erc1155Address);

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

  allowance = async (addr: string, erc1155Address: string) => {
    if (!this.web3.utils.isAddress(erc1155Address)) {
      throw new Error('Invalid token address');
    }

    const erc1155Contract = new this.web3.eth.Contract(MyERC1155Abi, erc1155Address);

    let res;
    try {
      res = await erc1155Contract.methods.allowance(addr, this.ethManagerAddress).call();
    } catch (e) {}

    return res;
  };

  lockNative = async (
    userAddr: string,
    amount: number,
    sendTxCallback?: (hash: string) => void
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
      this.ethManagerAddress
    );

    const response = await managerContract.methods
      .lockNative(mulDecimals(amount, 18), hmyAddrHex)
      .send({
        from: this.useMetamask ? accounts[0] : this.web3.eth.defaultAccount,
        gas: this.gasLimit,
        gasPrice: new BN(await this.web3.eth.getGasPrice()).mul(new BN(1)),
        value: mulDecimals(amount, 18),
      })
      .on('transactionHash', (hash: string) => sendTxCallback(hash));

    return response;
  };
}
