import { ACTION_TYPE, IOperation, STATUS } from '../interfaces';
import { logger } from '../utils/logs';
import { checkStatus, confirmCallback, getActionByType, waitAction } from '../operation-helpers';
import { EthMethods } from '../blockchain/eth/EthMethods';
import { HmyMethodsCommon } from '../blockchain/hmy';
import { ValidatorsAPI } from '../api';

export const oneToEth = async (
  api: ValidatorsAPI,
  operationParams: IOperation,
  ethMethods: EthMethods,
  hmyMethods: HmyMethodsCommon,
  prefix: string,
  maxWaitingTime: number
) => {
  let operation = await api.getOperation(operationParams.id);

  const approveHmyManger = getActionByType(operation, ACTION_TYPE.approveHmyManger);

  if (approveHmyManger && approveHmyManger.status === STATUS.WAITING) {
    logger.pending({ prefix, message: 'approveHmyManger' });

    const res: any = await hmyMethods.approveHmyManger(operationParams.amount, (hash: string) =>
      confirmCallback(api, hash, approveHmyManger.type, operation.id)
    );

    logger.info({ prefix, message: 'Status: ' + res.status });
    logger.success({ prefix, message: 'approveHmyManger' });
  }

  operation = await api.getOperation(operationParams.id);

  const burnToken = getActionByType(operation, ACTION_TYPE.burnToken);

  if (burnToken && burnToken.status === STATUS.WAITING) {
    logger.pending({ prefix, message: 'burnToken' });

    const res: any = await hmyMethods.burnToken(
      operationParams.ethAddress,
      operationParams.amount,
      (hash: string) => confirmCallback(api, hash, burnToken.type, operation.id)
    );

    logger.info({ prefix, message: 'Status: ' + res.status });
    logger.success({ prefix, message: 'burnToken' });
  }

  const unlockToken = await waitAction(
    api,
    operationParams.id,
    ACTION_TYPE.unlockToken,
    maxWaitingTime,
    prefix
  );

  if (!checkStatus(unlockToken, prefix, ACTION_TYPE.unlockToken)) {
    return false;
  }

  return true;
};
