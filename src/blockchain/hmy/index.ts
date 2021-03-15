import Web3 from 'web3';
import { HmyMethods } from './HmyMethods';
import { HmyMethodsWeb3 } from './HmyMethodsWeb3';
import { HmyMethodsERC20 } from './HmyMethodsERC20';
import { HmyMethodsERC20Web3 } from './HmyMethodsERC20Web3';
const { Harmony } = require('@harmony-js/core');
const { ChainType } = require('@harmony-js/utils');

import hmyLINKAbi from '../out/MyERC20';
import hmyLINKManagerAbi from '../out/LINKHmyManager';
import hmyManagerAbi from '../out/HmyManagerERC20';
import hmyERC721ManagerAbi from '../out/HmyManagerERC721';
import hmyDepositAbi from '../out/HmyDeposit';
import { HmyMethodsDepositWeb3 } from './HmyMethodsDepositWeb3';
import { HmyMethodsDeposit } from './HmyMethodsDeposit';

export type HmyMethodsCommon = HmyMethods | HmyMethodsWeb3;
export type HmyMethodsDepositCommon = HmyMethodsDeposit | HmyMethodsDepositWeb3;
export type HmyMethodsErc20Common = HmyMethodsERC20 | HmyMethodsERC20Web3;

export interface IHmyClient {
  hmyMethodsBUSD: HmyMethodsCommon;
  hmyMethodsLINK: HmyMethodsCommon;
  hmyMethodsDeposit: HmyMethodsDepositCommon;
  hmyMethodsERC20: HmyMethodsErc20Common;
  hmyMethodsERC721: HmyMethodsErc20Common;
  getHmyBalance: (addr: string) => Promise<string>;
  getBech32Address: (addr: string) => string;
  addWallet: (pk: string) => void;
  getUserAddress: () => string;
  setUseOneWallet: (value: boolean) => void;
  setUseMathWallet: (value: boolean) => void;
}

export interface IHmyClientParams {
  sdk?: 'harmony' | 'web3';
  nodeURL: string;
  chainId: number;
  contracts: {
    busd: string;
    link: string;
    busdManager: string;
    linkManager: string;
    erc20Manager: string;
    erc721Manager: string;
    depositManager: string;
  };
  gasLimit?: number;
  gasPrice?: number;
}

export const getHmyClient = async (params: IHmyClientParams): Promise<IHmyClient> => {
  const hmy = new Harmony(
    // let's assume we deploy smart contract to this end-point URL
    params.nodeURL,
    {
      chainType: ChainType.Harmony,
      chainId: Number(params.chainId),
    }
  );

  const { contracts } = params;

  // const hmyUserAccount = params.privateKey
  //   ? hmy.wallet.addByPrivateKey(params.privateKey)
  //   : await hmy.wallet.createAccount();

  // const hmyUserAccount = await hmy.wallet.createAccount();
  let userAddress: string;

  let hmyMethodsLINK: HmyMethodsCommon,
    hmyMethodsBUSD: HmyMethodsCommon,
    hmyMethodsERC20: HmyMethodsErc20Common,
    hmyMethodsERC721: HmyMethodsErc20Common,
    hmyMethodsDeposit: HmyMethodsDepositCommon;

  const web3 = new Web3(params.nodeURL);

  if (params.sdk === 'web3') {
    const hmyBUSDContract = new web3.eth.Contract(hmyLINKAbi, contracts.busd);

    const hmyBUSDManagerContract = new web3.eth.Contract(hmyLINKManagerAbi, contracts.busdManager);

    const hmyLINKContract = new web3.eth.Contract(hmyLINKAbi, contracts.link);

    const hmyLINKManagerContract = new web3.eth.Contract(hmyLINKManagerAbi, contracts.linkManager);

    const hmyManagerContract = new web3.eth.Contract(hmyManagerAbi, contracts.erc20Manager);

    const hmyDepositContract = new web3.eth.Contract(hmyDepositAbi, contracts.depositManager);

    hmyMethodsDeposit = new HmyMethodsDepositWeb3({
      hmy: web3,
      hmyTokenContract: hmyBUSDContract,
      hmyManagerContract: hmyDepositContract,
      hmyManagerContractAddress: contracts.depositManager,
    });

    hmyMethodsBUSD = new HmyMethodsWeb3({
      hmy: web3,
      hmyTokenContract: hmyBUSDContract,
      hmyManagerContract: hmyBUSDManagerContract,
      hmyManagerContractAddress: contracts.busdManager,
    });

    hmyMethodsLINK = new HmyMethodsWeb3({
      hmy: web3,
      hmyTokenContract: hmyLINKContract,
      hmyManagerContract: hmyLINKManagerContract,
      hmyManagerContractAddress: contracts.linkManager,
    });

    hmyMethodsERC20 = new HmyMethodsERC20Web3({
      hmy: web3,
      hmyManagerContract: hmyManagerContract,
      hmyManagerContractAddress: contracts.erc20Manager,
    });
  } else {
    const hmyDepositContract = hmy.contracts.createContract(
      hmyDepositAbi,
      contracts.depositManager
    );

    const hmyBUSDContract = hmy.contracts.createContract(hmyLINKAbi, contracts.busd);

    const hmyBUSDManagerContract = hmy.contracts.createContract(
      hmyLINKManagerAbi,
      contracts.busdManager
    );

    const hmyLINKContract = hmy.contracts.createContract(hmyLINKAbi, contracts.link);

    const hmyLINKManagerContract = hmy.contracts.createContract(
      hmyLINKManagerAbi,
      contracts.linkManager
    );

    const hmyManagerContract = hmy.contracts.createContract(hmyManagerAbi, contracts.erc20Manager);
    const hmyManagerERC721Contract = hmy.contracts.createContract(
      hmyERC721ManagerAbi,
      contracts.erc721Manager
    );

    hmyMethodsBUSD = new HmyMethods({
      hmy: hmy,
      hmyTokenContract: hmyBUSDContract,
      hmyManagerContract: hmyBUSDManagerContract,
    });

    hmyMethodsDeposit = new HmyMethodsDeposit({
      hmy: hmy,
      hmyTokenContract: hmyBUSDContract,
      hmyManagerContract: hmyDepositContract,
    });

    hmyMethodsLINK = new HmyMethods({
      hmy: hmy,
      hmyTokenContract: hmyLINKContract,
      hmyManagerContract: hmyLINKManagerContract,
    });

    hmyMethodsERC20 = new HmyMethodsERC20({
      hmy: hmy,
      hmyManagerContract: hmyManagerContract,
    });

    hmyMethodsERC721 = new HmyMethodsERC20({
      hmy: hmy,
      hmyManagerContract: hmyManagerERC721Contract,
    });
  }

  return {
    addWallet: async (privateKey: string) => {
      if (params.sdk === 'web3') {
        const ethUserAccount = await web3.eth.accounts.privateKeyToAccount(privateKey);
        web3.eth.accounts.wallet.add(ethUserAccount);
        web3.eth.defaultAccount = ethUserAccount.address;

        userAddress = ethUserAccount.address;
      } else {
        const account = await hmy.wallet.addByPrivateKey(privateKey);
        userAddress = account.address;
      }
    },
    getUserAddress: () => userAddress,
    hmyMethodsBUSD,
    hmyMethodsLINK,
    hmyMethodsERC20,
    hmyMethodsERC721,
    hmyMethodsDeposit,
    getBech32Address: address => hmy.crypto.getAddress(address).bech32,
    getHmyBalance: address => hmy.blockchain.getBalance({ address }),
    setUseOneWallet: (value: boolean) => {
      if (params.sdk === 'web3') {
        hmyMethodsBUSD.setUseMetamask(value);
        hmyMethodsLINK.setUseMetamask(value);
        hmyMethodsERC20.setUseMetamask(value);
      } else {
        hmyMethodsBUSD.setUseOneWallet(value);
        hmyMethodsLINK.setUseOneWallet(value);
        hmyMethodsERC20.setUseOneWallet(value);
      }
    },
    setUseMathWallet: (value: boolean) => {
      if (params.sdk === 'web3') {
        hmyMethodsBUSD.setUseMetamask(value);
        hmyMethodsLINK.setUseMetamask(value);
        hmyMethodsERC20.setUseMetamask(value);
      } else {
        hmyMethodsBUSD.setUseMathWallet(value);
        hmyMethodsLINK.setUseMathWallet(value);
        hmyMethodsERC20.setUseMathWallet(value);
      }
    },
  };
};
