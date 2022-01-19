import { Harmony } from '@harmony-js/core';
import { Contract } from '@harmony-js/contract';
import { getAddress } from '@harmony-js/crypto';
import { connectToBrowserWallet } from './helpers';
import MyERC1155Abi from '../out/MyERC1155';
import { mulDecimals } from '../../utils';

interface IHmyMethodsInitParams {
  hmy: Harmony;
  hmyManagerContract: any;
  hmyTokenManagerAddress: string;
  options?: { gasPrice: number; gasLimit: number };
}

export class HmyMethodsERC1155 {
  private hmy?: Harmony;
  private hmyManagerContract: Contract;
  private hmyTokenManagerAddress: string;
  private options = { gasPrice: 30000000000, gasLimit: 6721900 };

  private useOneWallet = false;
  private useMathWallet = false;

  constructor(params: IHmyMethodsInitParams) {
    this.hmy = params.hmy;
    this.hmyManagerContract = params.hmyManagerContract;
    this.hmyTokenManagerAddress = params.hmyTokenManagerAddress;

    if (params.options) {
      this.options = params.options;
    }
  }

  setUseMetamask = (value: boolean) => value;

  setUseOneWallet = (value: boolean) => {
    // @ts-ignore
    if (!window || !window.onewallet) {
      throw new Error('OneWallet extension is not found');
    }

    this.useOneWallet = value;
  };

  setUseMathWallet = (value: boolean) => {
    // @ts-ignore
    if (!window || !window.harmony) {
      throw new Error('Math Wallet extension is not found');
    }

    this.useMathWallet = value;
  };

  setApprovalForAll = (hrc20Address: string, sendTxCallback?: (hash: string) => void) => {
    const hmyTokenContract = this.hmy.contracts.createContract(MyERC1155Abi, hrc20Address);

    return new Promise(async (resolve, reject) => {
      try {
        if (this.useOneWallet) {
          await connectToBrowserWallet(
            // @ts-ignore
            window.onewallet,
            this.hmy,
            hmyTokenContract.wallet,
            null,
            reject
          );
        }

        if (this.useMathWallet) {
          await connectToBrowserWallet(
            // @ts-ignore
            window.harmony,
            this.hmy,
            hmyTokenContract.wallet,
            null,
            reject
          );
        }

        const res = await hmyTokenContract.methods
          .setApprovalForAll(this.hmyManagerContract.address, true)
          .send(this.options)
          .on('transactionHash', sendTxCallback);

        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  };

  burnToken = async (
    hrc20Address: string,
    userAddr: string,
    amount: number,
    decimals: number,
    sendTxCallback?: (hash: string) => void
  ) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (this.useOneWallet) {
          await connectToBrowserWallet(
            // @ts-ignore
            window.onewallet,
            this.hmy,
            this.hmyManagerContract.wallet,
            null,
            reject
          );
        }

        if (this.useMathWallet) {
          await connectToBrowserWallet(
            // @ts-ignore
            window.harmony,
            this.hmy,
            this.hmyManagerContract.wallet,
            null,
            reject
          );
        }

        const response = await this.hmyManagerContract.methods
          .burnToken(hrc20Address, mulDecimals(amount, decimals), userAddr)
          .send(this.options)
          .on('transactionHash', sendTxCallback);

        resolve(response);
      } catch (e) {
        reject(e);
      }
    });
  };

  burnTokens = async (
    hrc1155Address: string,
    userAddr: string,
    tokenIds: number[],
    amounts: number[],
    sendTxCallback?: (hash: string) => void
  ) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (this.useOneWallet) {
          await connectToBrowserWallet(
            // @ts-ignore
            window.onewallet,
            this.hmy,
            this.hmyManagerContract.wallet,
            null,
            reject
          );
        }

        if (this.useMathWallet) {
          await connectToBrowserWallet(
            // @ts-ignore
            window.harmony,
            this.hmy,
            this.hmyManagerContract.wallet,
            null,
            reject
          );
        }

        const hmyAddrHex = getAddress(userAddr).checksum;
        const hrc1155AddressHex = getAddress(hrc1155Address).checksum;

        const response = await this.hmyManagerContract.methods
          .burnTokens(hrc1155AddressHex, tokenIds, hmyAddrHex, amounts)
          .send(this.options)
          .on('transactionHash', sendTxCallback);

        resolve(response.transaction.id);
      } catch (e) {
        reject(e);
      }
    });
  };

  getMappingFor = async (erc1155TokenAddr: string) => {
    const tokenManager = this.hmy.contracts.createContract(
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
      this.hmyTokenManagerAddress
    );

    const res = await tokenManager.methods.mappedTokens(erc1155TokenAddr).call(this.options);

    return res;
  };

  checkHmyBalance = async (hrc20Address: string, addr: string) => {
    const hmyTokenContract = this.hmy.contracts.createContract(MyERC1155Abi, hrc20Address);

    const addrHex = this.hmy.crypto.getAddress(addr).checksum;

    return await hmyTokenContract.methods.balanceOf(addrHex).call(this.options);
  };

  totalSupply = async (hrc20Address: string) => {
    const hmyTokenContract = this.hmy.contracts.createContract(MyERC1155Abi, hrc20Address);

    return await hmyTokenContract.methods.totalSupply().call(this.options);
  };

  allowance = async (addr: string, erc1155Address: string) => {
    const tokenAddrHex = this.hmy.crypto.getAddress(erc1155Address).checksum;
    const hmyTokenContract = this.hmy.contracts.createContract(MyERC1155Abi, tokenAddrHex);
    const addrHex = this.hmy.crypto.getAddress(addr).checksum;

    return await hmyTokenContract.methods
      .allowance(addrHex, this.hmyManagerContract.address)
      .call(this.options);
  };

  lockOne = async (userAddr: string, amount: number, sendTxCallback?: (hash: string) => void) => {
    return new Promise(async (resolve, reject) => {
      try {
        const managerContract = this.hmy.contracts.createContract(
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
          this.hmyManagerContract.address
        );

        if (this.useOneWallet) {
          await connectToBrowserWallet(
            // @ts-ignore
            window.onewallet,
            this.hmy,
            this.hmyManagerContract.wallet,
            null,
            reject
          );
        }

        if (this.useMathWallet) {
          await connectToBrowserWallet(
            // @ts-ignore
            window.harmony,
            this.hmy,
            this.hmyManagerContract.wallet,
            null,
            reject
          );
        }

        const res = await managerContract.methods
          .lockNative(mulDecimals(amount, 18), userAddr)
          .send({ ...this.options, value: mulDecimals(amount, 18) })
          .on('transactionHash', sendTxCallback);

        // return transaction.events.Locked;

        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  };

  balanceOf = async (erc1155Address: string, tokenId: string) => {
    // @ts-ignore
    const { address } = await window.onewallet.getAccount();
    const hmyAddrHex = getAddress(address).checksum;
    const erc721Contract = this.hmy.contracts.createContract(MyERC1155Abi, erc1155Address);

    return await erc721Contract.methods.balanceOf(hmyAddrHex, tokenId).call(this.options);
  };

  tokenDetails = async (hrc20Address: string) => {
    const hmyAddrHex = getAddress(hrc20Address).checksum;

    const erc1155Contract = this.hmy.contracts.createContract(MyERC1155Abi, hmyAddrHex);

    const symbol = await erc1155Contract.methods.symbol().call(this.options);

    let name = symbol;

    try {
      name = await erc1155Contract.methods.name().call(this.options);
    } catch (e) {}

    const decimals = await erc1155Contract.methods.decimals().call(this.options);

    return { name, symbol, decimals: String(Number('0x' + decimals)), hrc20Address };
  };
}
