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
  ethPK: string;
  hmyPK: string;
  useWallet: boolean;
  network: 'mainnet' | 'testnet';
}

export class BridgeSDK {
  api: ValidatorsAPI;
  web3Client: IWeb3Client;
  hmyClient: IHmyClient;

  constructor() {}

  init = async (params: IBridgeSDKParams) => {
    this.api = new ValidatorsAPI(params.api);

    this.web3Client = getWeb3Client({
      ...confgis.eth[params.network],
      privateKey: params.ethPK,
      useWallet: params.useWallet,
    });

    this.hmyClient = await getHmyClient({
      ...confgis.hmy[params.network],
      privateKey: params.hmyPK,
      useWallet: params.useWallet,
    });
  };

  sendToken = async (params: {
    type: EXCHANGE_MODE;
    token: TOKEN;
    amount: number;
    erc20Address?: string;
  }) => {
    return await operation({
      ...params,
      api: this.api,
      web3Client: this.web3Client,
      hmyClient: this.hmyClient,
    });
  };
}
