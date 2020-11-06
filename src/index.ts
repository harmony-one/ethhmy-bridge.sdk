export * from './interfaces';

import { IAPIParams, ValidatorsAPI } from './api';
import { IWeb3Client, IHmyClient } from './blockchain';
import { getWeb3Client } from './blockchain/eth';
import { getHmyClient } from './blockchain/hmy';
import { operation } from './operation';
import { EXCHANGE_MODE, TOKEN } from './interfaces';
import confgis from './configs';

interface IBridgeSDKParams {
  api: IAPIParams;
  ethClient: typeof confgis.eth.mainnet;
  hmyClient: typeof confgis.hmy.mainnet;
}

export class BridgeSDK {
  api: ValidatorsAPI;
  web3Client: IWeb3Client;
  hmyClient: IHmyClient;

  constructor() {}

  init = async (params: IBridgeSDKParams) => {
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

  sendToken = async (params: {
    type: EXCHANGE_MODE;
    token: TOKEN;
    amount: number;
    oneAddress: string;
    ethAddress: string;
    erc20Address?: string;
  }, callback?: (id: string) => void) => {
    return await operation({
      ...params,
      api: this.api,
      web3Client: this.web3Client,
      hmyClient: this.hmyClient,
    }, callback);
  };
}
