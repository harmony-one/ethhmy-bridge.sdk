import { OperationClass } from './OperationClass';

export * from './interfaces';
export * from './configs';

import { IAPIParams, ICreateOperationParams, ValidatorsAPI } from './api';
import { IWeb3Client, IHmyClient } from './blockchain';
import { getWeb3Client } from './blockchain/eth';
import { getHmyClient } from './blockchain/hmy';
import { operation } from './operation';
import { EXCHANGE_MODE, NETWORK_TYPE, TOKEN } from './interfaces';
import * as configs from './configs';
import { logger } from './utils/logs';

interface IBridgeSDKInitParams {
  api: IAPIParams;
  ethClient: typeof configs.mainnet.ethClient;
  binanceClient: typeof configs.mainnet.binanceClient;
  hmyClient: typeof configs.mainnet.hmyClient;
  sdk?: 'harmony' | 'web3';
}

interface IBridgeSDKOptions {
  logLevel?: number;
}

export class BridgeSDK {
  api: ValidatorsAPI;
  ethClient: IWeb3Client;
  bscClient: IWeb3Client;
  hmyClient: IHmyClient;
  initParams: IBridgeSDKInitParams;

  constructor(params?: IBridgeSDKOptions) {
    logger.setLogLevel(params.logLevel);
  }

  init = async (params: IBridgeSDKInitParams) => {
    this.initParams = params;
    this.api = new ValidatorsAPI(params.api);
    this.ethClient = getWeb3Client(params.ethClient);
    this.bscClient = getWeb3Client(params.binanceClient);
    this.hmyClient = await getHmyClient({ ...params.hmyClient, sdk: params.sdk });
  };

  addOneWallet = async (privateKey: string) => {
    await this.hmyClient.addWallet(privateKey);
  };

  addEthWallet = async (privateKey: string) => {
    await this.ethClient.addWallet(privateKey);
    await this.bscClient.addWallet(privateKey);
  };

  setUseMetamask = (value: boolean) => {
    this.ethClient.setUseMetamask(value);
    this.bscClient.setUseMetamask(value);
  };

  setUseOneWallet = (value: boolean) => this.hmyClient.setUseOneWallet(value);

  setUseMathWallet = (value: boolean) => this.hmyClient.setUseMathWallet(value);

  sendToken = async (
    params: {
      type: EXCHANGE_MODE;
      token: TOKEN;
      amount: number;
      network?: NETWORK_TYPE;
      oneAddress: string;
      ethAddress: string;
      erc20Address?: string;
      hrc20Address?: string;
      maxWaitingTime?: number;
      erc1155Address?: string;
      hrc721Address?: string;
      hrc1155Address?: string;
      hrc1155TokenId?: any;
      erc1155TokenId?: any;
    },
    callback?: (id: string) => void
  ) => {
    const web3Client = params.network === NETWORK_TYPE.BINANCE ? this.bscClient : this.ethClient;

    let hrc20AddressNative;

    if (params.token === TOKEN.ETH) {
      hrc20AddressNative =
        params.network === NETWORK_TYPE.BINANCE
          ? this.initParams.binanceClient.contracts.nativeTokenHRC20
          : this.initParams.ethClient.contracts.nativeTokenHRC20;
    }

    return await operation(
      {
        ...params,
        hrc20Address: hrc20AddressNative || params.hrc20Address,
        api: this.api,
        web3Client,
        hmyClient: this.hmyClient,
        maxWaitingTime: params.maxWaitingTime || 20 * 60,
        network: params.network || NETWORK_TYPE.ETHEREUM,
      },
      callback
    );
  };

  createOperation = async (params: ICreateOperationParams) => {
    const operation = new OperationClass(this);

    await operation.create(params);

    return operation;
  };

  restoreOperationById = async (id: string) => {
    const operation = new OperationClass(this);

    await operation.restoreById(id);

    return operation;
  };
}
