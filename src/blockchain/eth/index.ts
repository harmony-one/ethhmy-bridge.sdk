import { EthMethods } from './EthMethods';
import { EthMethodsERC20 } from './EthMethodsERC20';
const Web3 = require('web3');

import ethLINKAbi from '../out/MyERC20';
import ethLINKManagerAbi from '../out/LINKEthManager';
import ethManagerAbi from '../out/EthManagerERC20';
import { abi as ethManagerAbiHRC20 } from '../out/EthManagerHRC20';
import ethERC721ManagerAbi from '../out/EthManagerERC721';
import { EthMethodsHRC20 } from './EthMethodsHRC20';
import { EthMethodsNative } from './EthMethodsNative';

export interface IWeb3Client {
  web3: typeof Web3;
  getEthBalance: (addr: string) => Promise<string>;
  ethMethodsBUSD: EthMethods;
  ethMethodsLINK: EthMethods;
  ethMethodsERC20: EthMethodsERC20;
  ethMethodsNative: EthMethodsNative;
  ethMethodsHRC20: EthMethodsHRC20;
  ethMethodsERС721: EthMethodsERC20;
  getUserAddress: () => string;
  addWallet: (pk: string) => void;
  setUseMetamask: (value: boolean) => void;
}

export interface IWeb3ClientParams {
  nodeURL: string;
  contracts: {
    busd: string;
    link: string;
    busdManager: string;
    linkManager: string;
    erc20Manager: string;
    erc721Manager: string;

    multisigWallet: string;
    hrc20Manager: string;
    ethManager: string;
    tokenManager: string;
    nativeTokenHRC20: string;
  };
  gasPrice?: number;
  gasLimit?: number;
  gasApiKey?: string;
}

export const getWeb3Client = (params: IWeb3ClientParams): IWeb3Client => {
  // @ts-ignore
  let web3URL;

  try {
    // @ts-ignore
    web3URL = window.web3.currentProvider;
  } catch (e) {
    web3URL = params.nodeURL;
  }

  const web3 = new Web3(web3URL);

  let ethUserAccount: any;
  // const ethUserAccount = params.privateKey
  //   ? web3.eth.accounts.privateKeyToAccount(params.privateKey)
  //   : web3.eth.accounts.create();
  // let ethUserAccount = web3.eth.accounts.create();
  //
  // web3.eth.accounts.wallet.add(ethUserAccount);
  // web3.eth.defaultAccount = ethUserAccount.address;

  const { contracts, gasPrice = 100000000000, gasLimit = 150000, gasApiKey = '' } = params;

  const ethBUSDContract = new web3.eth.Contract(ethLINKAbi, contracts.busd);

  const ethBUSDManagerContract = new web3.eth.Contract(ethLINKManagerAbi, contracts.busdManager);

  const ethLINKContract = new web3.eth.Contract(ethLINKAbi, contracts.link);

  const ethLINKManagerContract = new web3.eth.Contract(ethLINKManagerAbi, contracts.linkManager);

  const ethMethodsBUSD = new EthMethods({
    web3: web3,
    ethTokenContract: ethBUSDContract,
    ethManagerContract: ethBUSDManagerContract,
    ethManagerAddress: contracts.busdManager,
    gasPrice,
    gasLimit,
    gasApiKey,
  });

  const ethMethodsLINK = new EthMethods({
    web3: web3,
    ethTokenContract: ethLINKContract,
    ethManagerContract: ethLINKManagerContract,
    ethManagerAddress: contracts.linkManager,
    gasPrice,
    gasLimit,
    gasApiKey,
  });

  const ethManagerContract = new web3.eth.Contract(ethManagerAbi, contracts.erc20Manager);
  const ethManagerContractHRC20 = new web3.eth.Contract(ethManagerAbiHRC20, contracts.hrc20Manager);

  const ethMethodsERC20 = new EthMethodsERC20({
    web3: web3,
    ethManagerContract: ethManagerContract,
    ethManagerAddress: contracts.erc20Manager,
    gasPrice,
    gasLimit,
    gasApiKey,
  });

  const ethMethodsNative = new EthMethodsNative({
    web3: web3,
    ethManagerAddress: contracts.ethManager,
    gasPrice,
    gasLimit,
    gasApiKey,
  });

  const ethMethodsHRC20 = new EthMethodsHRC20({
    web3: web3,
    ethManagerContract: ethManagerContractHRC20,
    ethManagerAddress: contracts.hrc20Manager,
    ethTokenManagerAddress: contracts.tokenManager,
    gasPrice,
    gasLimit,
    gasApiKey,
  });

  const ethManagerContractERC721 = new web3.eth.Contract(
    ethERC721ManagerAbi,
    contracts.erc721Manager
  );

  const ethMethodsERС721 = new EthMethodsERC20({
    web3: web3,
    ethManagerContract: ethManagerContractERC721,
    ethManagerAddress: contracts.erc721Manager,
    gasPrice,
    gasLimit,
    gasApiKey,
  });

  const getEthBalance = (ethAddress: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      web3.eth.getBalance(ethAddress, (err: string, balance: string) => {
        if (err) {
          reject(err);
        }
        // const rez = String(new BN(balance).div(new BN(1e18)));

        resolve(String(Number(balance) / 1e18));
      });
    });
  };

  return {
    addWallet: async (privateKey: string) => {
      ethUserAccount = await web3.eth.accounts.privateKeyToAccount(privateKey);
      web3.eth.accounts.wallet.add(ethUserAccount);
      web3.eth.defaultAccount = ethUserAccount.address;
    },
    web3,
    getEthBalance,
    ethMethodsBUSD,
    ethMethodsLINK,
    ethMethodsNative,
    ethMethodsERC20,
    ethMethodsHRC20,
    ethMethodsERС721,
    getUserAddress: () => ethUserAccount && ethUserAccount.address,
    setUseMetamask: (value: boolean) => {
      ethMethodsBUSD.setUseMetamask(value);
      ethMethodsLINK.setUseMetamask(value);
      ethMethodsERC20.setUseMetamask(value);
      ethMethodsNative.setUseMetamask(value);
    },
  };
};
