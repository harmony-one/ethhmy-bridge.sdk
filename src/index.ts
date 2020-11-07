export * from './interfaces';
export * from './configs';

import { IAPIParams, ValidatorsAPI } from './api';
import { IWeb3Client, IHmyClient } from './blockchain';
import { getWeb3Client } from './blockchain/eth';
import { getHmyClient } from './blockchain/hmy';
import { operation } from './operation';
import { EXCHANGE_MODE, TOKEN } from './interfaces';
import * as configs from './configs';
import { logger } from './utils/logs';

interface IBridgeSDKInitParams {
  api: IAPIParams;
  ethClient: typeof configs.mainnet.ethClient;
  hmyClient: typeof configs.mainnet.hmyClient;
}

interface IBridgeSDKOptions {
  logLevel?: number;
}

export class BridgeSDK {
  api: ValidatorsAPI;
  web3Client: IWeb3Client;
  hmyClient: IHmyClient;

  constructor(params?: IBridgeSDKOptions) {
    logger.setLogLevel(params.logLevel);
  }

  init = async (params: IBridgeSDKInitParams) => {
    this.api = new ValidatorsAPI(params.api);
    this.web3Client = getWeb3Client(params.ethClient);
    this.hmyClient = await getHmyClient(params.hmyClient);
  };

  addOneWallet = async (privateKey: string) => {
    await this.hmyClient.addWallet(privateKey);
  };

  addEthWallet = async (privateKey: string) => {
    await this.web3Client.addWallet(privateKey);
  };

  sendToken = async (
    params: {
      type: EXCHANGE_MODE;
      token: TOKEN;
      amount: number;
      oneAddress: string;
      ethAddress: string;
      erc20Address?: string;
      maxWaitingTime?: number;
    },
    callback?: (id: string) => void
  ) => {
    return await operation(
      {
        ...params,
        api: this.api,
        web3Client: this.web3Client,
        hmyClient: this.hmyClient,
        maxWaitingTime: params.maxWaitingTime || 20 * 60,
      },
      callback
    );
  };
}
