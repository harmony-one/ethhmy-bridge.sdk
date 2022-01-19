import * as agent from 'superagent';
import { EXCHANGE_MODE, IOperation, ITokenInfo, TOKEN } from '../interfaces';
import { uuid } from '../utils';

export interface IAPIParams {
  validators: string[];
  threshold: number;
  assetServiceUrl: string;
}

export interface ICreateOperationParams {
  type: EXCHANGE_MODE;
  token: TOKEN;
  oneAddress: string;
  ethAddress: string;
  amount: number;
  erc20Address?: string;
  hrc20Address?: string;
}

interface IMintTokens {
  address: string;
  token: string;
}

export interface IConfirmActionParams {
  operationId: string;
  actionType: string;
  transactionHash: string;
}

export class ValidatorsAPI {
  servers: string[] = [];
  assetServiceUrl: string;
  threshold = 2;

  constructor(params: IAPIParams) {
    this.servers = params.validators || [];
    this.assetServiceUrl = params.assetServiceUrl || '';
    this.threshold = params.threshold || 2;
  }

  callAvailableServer = async (func: (url: string) => Promise<any>, server = 0) => {
    let error;

    for (let i = server; i < this.servers.length; i++) {
      try {
        return await func(this.servers[i]);
      } catch (e) {
        error = e;
      }
    }

    throw error;
  };

  callActionN = async (func: (url: string) => Promise<any>) => {
    let error;
    let confirmSuccess = 0;
    let res;

    for (let i = 0; i < this.servers.length; i++) {
      try {
        res = await func(this.servers[i]);
        confirmSuccess++;
      } catch (e) {
        error = e;
      }
    }

    if (confirmSuccess >= Number(this.threshold)) {
      return res;
    }

    throw error;
  };

  callAction = async (func: (url: string) => Promise<any>) => {
    let error;

    const res: any[] = await Promise.all(
      this.servers.map(async url => {
        try {
          return await func(url);
        } catch (e) {
          error = e;
          return false;
        }
      })
    );

    const success = res.filter(r => !!r);

    if (success.length >= Number(this.threshold)) {
      return success[0];
    }

    throw error;
  };

  createOperation = async (params: ICreateOperationParams): Promise<IOperation> => {
    const id = uuid();

    return this.callAction(async url => {
      const res = await agent.post<{ body: IOperation }>(url + '/operations', { id, ...params });

      return res.body;
    });
  };

  confirmAction = async (params: IConfirmActionParams) => {
    return this.callAction(async url => {
      const res = await agent.post<{ body: IOperation }>(
        `${url}/operations/${params.operationId}/actions/${params.actionType}/confirm`,
        { transactionHash: params.transactionHash }
      );

      return res.body;
    });
  };

  getOperation = async (id: string): Promise<IOperation> => {
    return this.callAvailableServer(async url => {
      const res = await agent.get<{ body: IOperation }>(url + '/operations/' + id);

      return res.body;
    });
  };

  getOperations = async (params: any): Promise<{ content: IOperation[] }> => {
    return this.callAvailableServer(async url => {
      const res = await agent.get<{ body: IOperation[] }>(url + '/operations/', params);

      return res.body;
    });
  };

  getTokensInfo = async (params: any): Promise<{ content: ITokenInfo[] }> => {
    const res = await agent.get<{ body: ITokenInfo[] & { content: ITokenInfo[] } }>(
      this.assetServiceUrl + '/tokens/',
      params
    );

    const content = res.body.content;

    return { ...res.body, content };
  };

  mintTokens = async (params: IMintTokens) => {
    const res = await agent.post<{
      body: { status: string; transactionHash: string; error: string };
    }>(`${this.servers[0]}/get-token`, params);

    return res.body;
  };
}
