import { EthMethods } from './EthMethods';
import { EthMethodsERC20 } from './EthMethodsERC20';
const Web3 = require('web3');

import ethLINKAbi from '../out/MyERC20';
import ethLINKManagerAbi from '../out/LINKEthManager';
import ethManagerAbi from '../out/EthManagerERC20';

export interface IWeb3Client {
  web3: typeof Web3;
  getEthBalance: (addr: string) => Promise<string>;
  ethMethodsBUSD: EthMethods;
  ethMethodsLINK: EthMethods;
  ethMethodsERC20: EthMethodsERC20;
  userAddress: string;
  addWallet: (pk: string) => void;
}

export interface IWeb3ClientParams {
  nodeURL: string;
  contracts: {
    busd: string;
    link: string;
    busdManager: string;
    linkManager: string;
    erc20Manager: string;
  };
  gasPrice?: number;
  gasLimit?: number;
  gasApiKey?: string;
}

export const getWeb3Client = (params: IWeb3ClientParams): IWeb3Client => {
  const web3 = new Web3(params.nodeURL);

  // const ethUserAccount = params.privateKey
  //   ? web3.eth.accounts.privateKeyToAccount(params.privateKey)
  //   : web3.eth.accounts.create();
  const ethUserAccount = web3.eth.accounts.create();

  web3.eth.accounts.wallet.add(ethUserAccount);
  web3.eth.defaultAccount = ethUserAccount.address;

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
    userAddress: ethUserAccount.address,
    gasPrice,
    gasLimit,
    gasApiKey,
  });

  const ethMethodsLINK = new EthMethods({
    web3: web3,
    ethTokenContract: ethLINKContract,
    ethManagerContract: ethLINKManagerContract,
    ethManagerAddress: contracts.linkManager,
    userAddress: ethUserAccount.address,
    gasPrice,
    gasLimit,
    gasApiKey,
  });

  const ethManagerContract = new web3.eth.Contract(ethManagerAbi, contracts.erc20Manager);

  const ethMethodsERC20 = new EthMethodsERC20({
    web3: web3,
    ethManagerContract: ethManagerContract,
    ethManagerAddress: contracts.erc20Manager,
    userAddress: ethUserAccount.address,
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
      await web3.eth.accounts.privateKeyToAccount(privateKey);
      web3.eth.accounts.wallet.add(ethUserAccount);
      web3.eth.defaultAccount = ethUserAccount.address;
    },
    web3,
    getEthBalance,
    ethMethodsBUSD,
    ethMethodsLINK,
    ethMethodsERC20,
    userAddress: ethUserAccount.address,
  };
};
