import { getAddress } from '@harmony-js/crypto';
import Web3 from 'web3';
import { withDecimals } from '../utils';
const BN = require('bn.js');

export interface IEthMethodsInitParams {
  web3: Web3;
  gasPrice: number;
  gasLimit: number;
  gasApiKey: string;
  ethManagerAddress: string;
}

export class EthMethodsNative {
  private web3: Web3;
  private ethManagerAddress: string;
  private useMetamask = false;

  gasPrice: number;
  gasLimit: number;
  gasApiKey: string;

  constructor(params: IEthMethodsInitParams) {
    this.web3 = params.web3;
    this.ethManagerAddress = params.ethManagerAddress;

    this.gasPrice = params.gasPrice;
    this.gasLimit = params.gasLimit;
    this.gasApiKey = params.gasApiKey;
  }

  setUseMetamask = (value: boolean) => (this.useMetamask = value);

  lockEth = async (userAddr: string, amount: number, sendTxCallback?: (addr: string) => void) => {
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
          name: 'lockEth',
          outputs: [],
          payable: true,
          stateMutability: 'payable',
          type: 'function',
        },
      ],
      this.ethManagerAddress
    );

    const response = await managerContract.methods
      .lockEth(withDecimals(amount, 18), hmyAddrHex)
      .send({
        from: this.useMetamask ? accounts[0] : this.web3.eth.defaultAccount,
        gas: this.gasLimit,
        gasPrice: new BN(await this.web3.eth.getGasPrice()).mul(new BN(1)),
        value: withDecimals(amount, 18),
      })
      .on('transactionHash', sendTxCallback);

    return response;
  };

  lockNative = async (
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
      this.ethManagerAddress
    );

    const response = await managerContract.methods
      .lockNative(withDecimals(amount, 18), hmyAddrHex)
      .send({
        from: this.useMetamask ? accounts[0] : this.web3.eth.defaultAccount,
        gas: this.gasLimit,
        gasPrice: new BN(await this.web3.eth.getGasPrice()).mul(new BN(1)),
        value: withDecimals(amount, 18),
      })
      .on('transactionHash', sendTxCallback);

    return response;
  };
}
