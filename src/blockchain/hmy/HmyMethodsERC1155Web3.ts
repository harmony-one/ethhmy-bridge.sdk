import { mulDecimals } from '../../utils';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { getAddress } from '@harmony-js/crypto';
import MyERC1155Abi from '../out/MyERC1155';

const BN = require('bn.js');

interface IHmyMethodsInitParams {
  web3: Web3;
  hmyManagerContract: Contract;
  hmyManagerContractAddress: string;
  options: { gasPrice: number; gasLimit: number };
  hmyTokenManagerAddress: string;
}

export class HmyMethodsERC1155Web3 {
  web3: Web3;
  private hmyManagerContract: Contract;
  hmyManagerContractAddress: string;
  private hmyTokenManagerAddress: string;
  private useMetamask = false;
  private gasLimit;

  constructor(params: IHmyMethodsInitParams) {
    this.web3 = params.web3;
    this.hmyManagerContract = params.hmyManagerContract;
    this.hmyManagerContractAddress = params.hmyManagerContractAddress;
    this.hmyTokenManagerAddress = params.hmyTokenManagerAddress;
    this.gasLimit = params.options.gasLimit;
  }

  setUseOneWallet = (value: boolean) => value;
  setUseMathWallet = (value: boolean) => value;
  setUseMetamask = (value: boolean) => (this.useMetamask = value);

  setApprovalForAll = async (hrc20Address: string, sendTxCallback?: (hash: string) => void) => {
    const hmyTokenContract = new this.web3.eth.Contract(
      MyERC1155Abi,
      hrc20Address,
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
        gasLimit: this.gasLimit,
        gasPrice: new BN(await this.web3.eth.getGasPrice()).mul(new BN(1)),
      })
      .on('transactionHash', sendTxCallback);
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
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    }

    const userAddrHex = getAddress(userAddr).checksum;

    return await this.hmyManagerContract.methods
      .burnToken(hrc20Address, mulDecimals(amount, decimals), userAddrHex)
      .send({
        from: this.useMetamask ? accounts[0] : this.web3.eth.defaultAccount,
        gasLimit: this.gasLimit,
        gasPrice: new BN(await this.web3.eth.getGasPrice()).mul(new BN(1)),
      })
      .on('transactionHash', sendTxCallback);
  };

  burnTokens = async (
    hrc1155Address: string,
    userAddr: string,
    tokenIds: number[],
    amounts: number[],
    sendTxCallback?: (hash: string) => void
  ) => {
    let accounts;
    if (this.useMetamask) {
      // @ts-ignore
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    }

    const hmyAddrHex = getAddress(userAddr).checksum;
    const hrc1155AddressHex = getAddress(hrc1155Address).checksum;

    return await this.hmyManagerContract.methods
      .burnTokens(hrc1155AddressHex, tokenIds, hmyAddrHex, amounts)
      .send({
        from: this.useMetamask ? accounts[0] : this.web3.eth.defaultAccount,
        gasLimit: this.gasLimit,
        gasPrice: new BN(await this.web3.eth.getGasPrice()).mul(new BN(1)),
      })
      .on('transactionHash', sendTxCallback);
  };

  getMappingFor = async (erc1155TokenAddr: string) => {
    const tokenManager = new this.web3.eth.Contract(
      [
        {
          constant: true,
          inputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          name: 'mappedTokens',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          payable: false,
          stateMutability: 'view',
          type: 'function',
        },
      ],
      this.hmyTokenManagerAddress,
    );

    return await tokenManager.methods.mappedTokens(erc1155TokenAddr).call();
  };

  checkHmyBalance = async (hrc20Address: string, addr: string) => {
    const hmyTokenContract = new this.web3.eth.Contract(
      MyERC1155Abi,
      hrc20Address,
    );

    const addrHex = getAddress(addr).checksum;

    return await hmyTokenContract.methods.balanceOf(addrHex).call();
  };

  totalSupply = async (hrc20Address: string) => {
    const hmyTokenContract = new this.web3.eth.Contract(
      MyERC1155Abi,
      hrc20Address,
    );

    return await hmyTokenContract.methods.totalSupply().call();
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

    const account = this.useMetamask ? accounts[0] : this.web3.eth.defaultAccount

    return await erc721Contract.methods.balanceOf(account, tokenId).call();
  };

  lockOne = async (userAddr: string, amount: number, sendTxCallback?: (hash: string) => void) => {
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
      this.hmyManagerContractAddress,
    );

    return await managerContract.methods
      .lockNative(mulDecimals(amount, 18), hmyAddrHex)
      .send({
        from: this.useMetamask ? accounts[0] : this.web3.eth.defaultAccount,
        gasLimit: this.gasLimit,
        gasPrice: new BN(await this.web3.eth.getGasPrice()).mul(new BN(1)),
        value: mulDecimals(amount, 18),
      })
      .on('transactionHash', sendTxCallback);
  };
}
