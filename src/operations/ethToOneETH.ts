import { ACTION_TYPE, IOperation, NETWORK_TYPE, STATUS } from '../interfaces';
import { logger } from '../utils/logs';
import { checkStatus, confirmCallback, getActionByType, waitAction } from '../operation-helpers';
import { HmyMethodsErc20Common } from '../blockchain/hmy';
import { ValidatorsAPI } from '../api';
import { EthMethodsNative } from '../blockchain/eth/EthMethodsNative';

export const ethToOneETH = async (
  api: ValidatorsAPI,
  operationParams: IOperation,
  ethMethods: EthMethodsNative,
  hmyMethods: HmyMethodsErc20Common,
  prefix: string,
  maxWaitingTime: number
) => {
  const operation = await api.getOperation(operationParams.id);

  const lockToken = getActionByType(operation, ACTION_TYPE.lockToken);

  if (lockToken && lockToken.status === STATUS.WAITING) {
    logger.pending({ prefix, message: 'lockToken' });

    let res;

    if (operation.network === NETWORK_TYPE.ETHEREUM) {
      res = await ethMethods.lockEth(
        operationParams.oneAddress,
        operationParams.amount,
        (hash: string) => confirmCallback(api, hash, lockToken.type, operationParams.id)
      );
    } else {
      console.log(111, operationParams.oneAddress, operationParams.amount);

      res = await ethMethods.lockNative(
        operationParams.oneAddress,
        operationParams.amount,
        (hash: string) => confirmCallback(api, hash, lockToken.type, operationParams.id)
      );
    }

    logger.info({ prefix, message: 'Status: ' + (res ? res.status : '') });
    logger.success({ prefix, message: 'lockToken' });
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
