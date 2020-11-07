import { ACTION_TYPE, IOperation, STATUS } from '../interfaces';
import { logger } from '../utils/logs';
import { checkStatus, confirmCallback, getActionByType, waitAction } from '../operation-helpers';
import { EthMethods } from '../blockchain/eth/EthMethods';
import { ValidatorsAPI } from '../api';

export const ethToOne = async (
  api: ValidatorsAPI,
  operationParams: IOperation,
  ethMethods: EthMethods,
  prefix: string,
  maxWaitingTime: number
) => {
  let operation = await api.getOperation(operationParams.id);

  const approveEthManger = getActionByType(operation, ACTION_TYPE.approveEthManger);

  if (approveEthManger && approveEthManger.status === STATUS.WAITING) {
    logger.pending({ prefix, message: 'approveEthManger' });

    const res = await ethMethods.approveEthManger(operationParams.amount, (hash: string) =>
      confirmCallback(api, hash, approveEthManger.type, operation.id)
    );

    logger.info({ prefix, message: 'Status: ' + res.status });
    logger.success({ prefix, message: 'approveEthManger' });
  }

  operation = await api.getOperation(operationParams.id);

  const lockToken = getActionByType(operation, ACTION_TYPE.lockToken);

  if (lockToken && lockToken.status === STATUS.WAITING) {
    logger.pending({ prefix, message: 'lockToken' });

    const res = await ethMethods.lockToken(
      operationParams.oneAddress,
      operationParams.amount,
      (hash: string) => confirmCallback(api, hash, lockToken.type, operation.id)
    );

    logger.info({ prefix, message: 'Status: ' + res.status });
    logger.success({ prefix, message: 'lockToken' });
  }

  const lockTokenAction = await waitAction(
    api,
    operationParams.id,
    ACTION_TYPE.lockToken,
    maxWaitingTime,
    prefix
  );

  if (!checkStatus(lockTokenAction, prefix, ACTION_TYPE.lockToken)) {
    return false;
  }

  const waitingBlockNumber = await waitAction(
    api,
    operationParams.id,
    ACTION_TYPE.waitingBlockNumber,
    maxWaitingTime,
    prefix
  );

  if (!checkStatus(waitingBlockNumber, prefix, ACTION_TYPE.waitingBlockNumber)) {
    return false;
  }

  const mintToken = await waitAction(
    api,
    operationParams.id,
    ACTION_TYPE.mintToken,
    maxWaitingTime,
    prefix
  );

  if (!checkStatus(mintToken, prefix, ACTION_TYPE.mintToken)) {
    return false;
  }

  return true;
};
