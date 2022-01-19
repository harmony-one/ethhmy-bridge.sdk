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
import { abi as hmyManagerAbiHRC20 } from '../out/HmyManagerHRC20';
import { abi as erc1155HmyManagerAbi } from '../out/ERC1155HmyManager';
import hmyERC721ManagerAbi from '../out/HmyManagerERC721';
import hmyDepositAbi from '../out/HmyDeposit';
import { HmyMethodsDepositWeb3 } from './HmyMethodsDepositWeb3';
import { HmyMethodsDeposit } from './HmyMethodsDeposit';
import { HmyMethodsHRC20 } from './HmyMethodsHRC20';
import { HmyMethodsHRC20Web3 } from './HmyMethodsHRC20Web3';
import { HmyMethodsERC1155 } from './HmyMethodsERC1155';
import { HmyMethodsERC1155Web3 } from './HmyMethodsERC1155Web3';

export type HmyMethodsCommon = HmyMethods | HmyMethodsWeb3;
export type HmyMethodsDepositCommon = HmyMethodsDeposit | HmyMethodsDepositWeb3;
export type HmyMethodsErc20Common = HmyMethodsERC20 | HmyMethodsERC20Web3;
export type HmyMethodsHrc20Common = HmyMethodsHRC20 | HmyMethodsHRC20Web3;
export type HmyMethodsERC1155Common = HmyMethodsERC1155 | HmyMethodsERC1155Web3;

export interface IHmyClient {
  hmyMethodsBUSD: HmyMethodsCommon;
  hmyMethodsLINK: HmyMethodsCommon;
  hmyMethodsDeposit: HmyMethodsDepositCommon;
  hmyMethodsERC20: HmyMethodsErc20Common;
  hmyMethodsERC20BSC: HmyMethodsErc20Common;
  hmyMethodsHRC20: HmyMethodsHrc20Common;
  hmyMethodsHRC20BSC: HmyMethodsHrc20Common;
  hmyMethodsERC721: HmyMethodsErc20Common;
  hmyMethodsERC1155: HmyMethodsERC1155Common;
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
    hrc20Manager: string;
    hrc20BSCManager: string;
    erc20BSCManager: string;
    bscTokenManager: string;
    HMY_HRC1155_MANAGER_CONTRACT: string;
    HMY_ERC1155_MANAGER_CONTRACT: string;
    HMY_ERC1155_MANAGER_TOKEN: string;
    HMY_HRC721_MANAGER_CONTRACT: string;
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
    hmyMethodsERC20BSC: HmyMethodsErc20Common,
    hmyMethodsHRC20: HmyMethodsHrc20Common,
    hmyMethodsHRC20BSC: HmyMethodsHrc20Common,
    hmyMethodsERC721: HmyMethodsErc20Common,
    hmyMethodsERC1155: HmyMethodsERC1155Common,
    hmyMethodsDeposit: HmyMethodsDepositCommon;

  // @ts-ignore
  let web3URL;

  try {
    // @ts-ignore
    web3URL = window.ethereum;
  } catch (e) {
    web3URL = params.nodeURL;
  }

  const web3 = new Web3(web3URL);

  if (params.sdk === 'web3') {
    const hmyBUSDContract = new web3.eth.Contract(hmyLINKAbi, contracts.busd);

    const hmyBUSDManagerContract = new web3.eth.Contract(hmyLINKManagerAbi, contracts.busdManager);

    const hmyLINKContract = new web3.eth.Contract(hmyLINKAbi, contracts.link);

    const hmyLINKManagerContract = new web3.eth.Contract(hmyLINKManagerAbi, contracts.linkManager);

    const hmyManagerContract = new web3.eth.Contract(hmyManagerAbi, contracts.erc20Manager);
    const hmyManagerContractBSC = new web3.eth.Contract(hmyManagerAbi, contracts.erc20BSCManager);

    const hmyManagerContractHRC20 = new web3.eth.Contract(
      hmyManagerAbiHRC20,
      contracts.hrc20Manager
    );

    const hmyManagerContractHRC20BSC = new web3.eth.Contract(
      hmyManagerAbiHRC20,
      contracts.hrc20BSCManager
    );

    const hmyManagerContractERC1155 = new web3.eth.Contract(
      erc1155HmyManagerAbi,
      contracts.HMY_ERC1155_MANAGER_CONTRACT
    );

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

    hmyMethodsERC20BSC = new HmyMethodsERC20Web3({
      hmy: web3,
      hmyManagerContract: hmyManagerContractBSC,
      hmyManagerContractAddress: contracts.erc20BSCManager,
    });

    hmyMethodsHRC20 = new HmyMethodsHRC20Web3({
      hmy: web3,
      hmyManagerContract: hmyManagerContractHRC20,
      hmyManagerContractAddress: contracts.hrc20Manager,
    });

    hmyMethodsHRC20BSC = new HmyMethodsHRC20Web3({
      hmy: web3,
      hmyManagerContract: hmyManagerContractHRC20BSC,
      hmyManagerContractAddress: contracts.hrc20BSCManager,
    });

    hmyMethodsERC1155 = new HmyMethodsERC1155Web3({
      web3,
      hmyManagerContract: hmyManagerContractERC1155,
      hmyManagerContractAddress: contracts.HMY_ERC1155_MANAGER_CONTRACT,
      hmyTokenManagerAddress: contracts.HMY_ERC1155_MANAGER_TOKEN,
      options: { gasPrice: 30000000000, gasLimit: 6721900 },
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

    const hmyManagerContractBSC = hmy.contracts.createContract(
      hmyManagerAbi,
      contracts.erc20BSCManager
    );

    const hmyManagerContractHRC20 = hmy.contracts.createContract(
      hmyManagerAbiHRC20,
      contracts.hrc20Manager
    );

    const hmyManagerContractHRC20BSC = hmy.contracts.createContract(
      hmyManagerAbiHRC20,
      contracts.hrc20BSCManager
    );

    const hmyManagerERC721Contract = hmy.contracts.createContract(
      hmyERC721ManagerAbi,
      contracts.erc721Manager
    );

    const hmyManagerERC1155Contract = hmy.contracts.createContract(
      erc1155HmyManagerAbi,
      contracts.HMY_ERC1155_MANAGER_CONTRACT
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

    hmyMethodsERC20BSC = new HmyMethodsERC20({
      hmy: hmy,
      hmyManagerContract: hmyManagerContractBSC,
    });

    hmyMethodsHRC20 = new HmyMethodsHRC20({
      hmy: hmy,
      hmyManagerContract: hmyManagerContractHRC20,
    });

    hmyMethodsHRC20BSC = new HmyMethodsHRC20({
      hmy: hmy,
      hmyManagerContract: hmyManagerContractHRC20BSC,
    });

    hmyMethodsERC721 = new HmyMethodsERC20({
      hmy: hmy,
      hmyManagerContract: hmyManagerERC721Contract,
    });

    hmyMethodsERC1155 = new HmyMethodsERC1155({
      hmy: hmy,
      hmyManagerContract: hmyManagerERC1155Contract,
      hmyTokenManagerAddress: contracts.HMY_ERC1155_MANAGER_TOKEN,
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
    hmyMethodsERC20BSC,
    hmyMethodsERC721,
    hmyMethodsERC1155,
    hmyMethodsDeposit,
    hmyMethodsHRC20,
    hmyMethodsHRC20BSC,
    getBech32Address: address => hmy.crypto.getAddress(address).bech32,
    getHmyBalance: address => hmy.blockchain.getBalance({ address }),
    setUseOneWallet: (value: boolean) => {
      if (params.sdk === 'web3') {
        hmyMethodsBUSD.setUseMetamask(value);
        hmyMethodsLINK.setUseMetamask(value);
        hmyMethodsERC20.setUseMetamask(value);
        hmyMethodsERC20BSC.setUseMetamask(value);
        hmyMethodsHRC20.setUseMetamask(value);
        hmyMethodsERC721.setUseMetamask(value);
        hmyMethodsERC1155.setUseMetamask(value);
        hmyMethodsDeposit.setUseMetamask(value);
        hmyMethodsHRC20BSC.setUseMetamask(value);
      } else {
        hmyMethodsBUSD.setUseOneWallet(value);
        hmyMethodsLINK.setUseOneWallet(value);
        hmyMethodsERC20.setUseOneWallet(value);
        hmyMethodsERC20BSC.setUseOneWallet(value);
        hmyMethodsHRC20.setUseOneWallet(value);
        hmyMethodsERC721.setUseOneWallet(value);
        hmyMethodsERC1155.setUseOneWallet(value);
        hmyMethodsDeposit.setUseOneWallet(value);
        hmyMethodsHRC20BSC.setUseOneWallet(value);
      }
    },
    setUseMathWallet: (value: boolean) => {
      if (params.sdk === 'web3') {
        hmyMethodsBUSD.setUseMetamask(value);
        hmyMethodsLINK.setUseMetamask(value);
        hmyMethodsERC20.setUseMetamask(value);
        hmyMethodsERC20BSC.setUseMetamask(value);
        hmyMethodsHRC20.setUseMetamask(value);
        hmyMethodsERC721.setUseMetamask(value);
        hmyMethodsERC1155.setUseMetamask(value);
        hmyMethodsDeposit.setUseMetamask(value);
        hmyMethodsHRC20BSC.setUseMetamask(value);
      } else {
        hmyMethodsBUSD.setUseMathWallet(value);
        hmyMethodsLINK.setUseMathWallet(value);
        hmyMethodsERC20.setUseMathWallet(value);
        hmyMethodsERC20BSC.setUseMathWallet(value);
        hmyMethodsHRC20.setUseMathWallet(value);
        hmyMethodsERC721.setUseMathWallet(value);
        hmyMethodsERC1155.setUseMathWallet(value);
        hmyMethodsDeposit.setUseMathWallet(value);
        hmyMethodsHRC20BSC.setUseMathWallet(value);
      }
    },
  };
};
