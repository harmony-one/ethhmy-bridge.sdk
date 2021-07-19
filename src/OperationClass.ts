import { ICreateOperationParams } from './api';
import { BridgeSDK, IOperation } from './index';

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
}
