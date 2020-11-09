import { HmyMethods } from './HmyMethods';
import { HmyMethodsERC20 } from './HmyMethodsERC20';
const { Harmony } = require('@harmony-js/core');
const { ChainType } = require('@harmony-js/utils');

import hmyLINKAbi from '../out/MyERC20';
import hmyLINKManagerAbi from '../out/LINKHmyManager';
import hmyManagerAbi from '../out/HmyManagerERC20';

export interface IHmyClient {
  hmy: any;
  hmyMethodsBUSD: HmyMethods;
  hmyMethodsLINK: HmyMethods;
  hmyMethodsERC20: HmyMethodsERC20;
  getHmyBalance: (addr: string) => Promise<string>;
  getBech32Address: (addr: string) => string;
  addWallet: (pk: string) => void;
  getUserAddress: () => string;
  setUseOneWallet: (value: boolean) => void;
  setUseMathWallet: (value: boolean) => void;
}

export interface IHmyClientParams {
  nodeURL: string;
  chainId: number;
  contracts: {
    busd: string;
    link: string;
    busdManager: string;
    linkManager: string;
    erc20Manager: string;
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

  const hmyMethodsBUSD = new HmyMethods({
    hmy: hmy,
    hmyTokenContract: hmyBUSDContract,
    hmyManagerContract: hmyBUSDManagerContract,
  });

  const hmyMethodsLINK = new HmyMethods({
    hmy: hmy,
    hmyTokenContract: hmyLINKContract,
    hmyManagerContract: hmyLINKManagerContract,
  });

  const hmyMethodsERC20 = new HmyMethodsERC20({
    hmy: hmy,
    hmyManagerContract: hmyManagerContract,
  });

  return {
    addWallet: async (privateKey: string) => {
      const account = await hmy.wallet.addByPrivateKey(privateKey);
      userAddress = account.address;
    },
    getUserAddress: () => userAddress,
    hmy,
    hmyMethodsBUSD,
    hmyMethodsLINK,
    hmyMethodsERC20,
    getBech32Address: address => hmy.crypto.getAddress(address).bech32,
    getHmyBalance: address => hmy.blockchain.getBalance({ address }),
    setUseOneWallet: (value: boolean) => {
      hmyMethodsBUSD.setUseOneWallet(value);
      hmyMethodsLINK.setUseOneWallet(value);
      hmyMethodsERC20.setUseOneWallet(value);
    },
    setUseMathWallet: (value: boolean) => {
      hmyMethodsBUSD.setUseMathWallet(value);
      hmyMethodsLINK.setUseMathWallet(value);
      hmyMethodsERC20.setUseMathWallet(value);
    },
  };
};
