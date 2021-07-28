import { ICreateOperationParams } from './api';
import { ACTION_TYPE, BridgeSDK, IOperation, STATUS } from './index';
import { sleep } from './utils';

export interface IConfirmActionParamsOperation {
  actionType: string;
  transactionHash: string;
}

export class OperationClass {
  sdk: BridgeSDK;
  operation: IOperation;

  constructor(sdk: BridgeSDK) {
    this.sdk = sdk;
  }

  create = async (params: ICreateOperationParams) => {
    this.operation = await this.sdk.api.createOperation(params);
  };

  getOperationId = () => this.operation.id;

  restoreById = async (id: string) => {
    this.operation = await this.sdk.api.getOperation(id);
  };

  confirmAction = async (params: IConfirmActionParamsOperation) => {
    return await this.sdk.api.confirmAction({ ...params, operationId: this.operation.id });
  };

  skipAction = async (actionType: string) => {
    return await this.sdk.api.confirmAction({
      actionType,
      transactionHash: 'skip',
      operationId: this.operation.id,
    });
  };

  waitOperationComplete = async () => {
    return new Promise(async (res, reject) => {
      try {
        while (
          this.operation.status === STATUS.IN_PROGRESS ||
          this.operation.status === STATUS.WAITING
        ) {
          this.operation = await this.sdk.api.getOperation(this.operation.id);
          await sleep(3000);
        }

        if (this.operation.status === STATUS.SUCCESS) {
          res(this.operation);
        } else {
          reject('Operation status: ' + this.operation.status);
        }
      } catch (e) {
        reject(e);
      }
    });
  };

  waitActionComplete = async (actionType: ACTION_TYPE) => {
    return new Promise(async (res, reject) => {
      try {
        const getAction = () => this.operation.actions.find(a => a.type === actionType);

        while (getAction().status === STATUS.IN_PROGRESS || getAction().status === STATUS.WAITING) {
          this.operation = await this.sdk.api.getOperation(this.operation.id);
          await sleep(3000);
        }

        if (getAction().status === STATUS.SUCCESS) {
          res(this.operation);
        } else {
          reject('Action status: ' + getAction().status);
        }
      } catch (e) {
        reject(e);
      }
    });
  };
}
