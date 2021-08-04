import { ACTION_TYPE, IOperation, NETWORK_TYPE, STATUS } from '../interfaces';
import { logger } from '../utils/logs';
import { checkStatus, confirmCallback, getActionByType, waitAction } from '../operation-helpers';
import { sleep } from '../utils';
import { HmyMethodsHrc20Common } from '../blockchain/hmy';
import { ValidatorsAPI } from '../api';
import { EthMethodsHRC20 } from '../blockchain/eth/EthMethodsHRC20';

export const oneToEthONE = async (
  api: ValidatorsAPI,
  operationParams: IOperation,
  ethMethods: EthMethodsHRC20,
  hmyMethods: HmyMethodsHrc20Common,
  prefix: string,
  maxWaitingTime: number
) => {
  let operation = await api.getOperation(operationParams.id);

  let getERC20Address = getActionByType(operation, ACTION_TYPE.getERC20Address);

  if (getERC20Address) {
    logger.wait({ prefix, message: 'getERC20Address' });
  }

  while (getERC20Address && [STATUS.IN_PROGRESS, STATUS.WAITING].includes(getERC20Address.status)) {
    await sleep(3000);
    operation = await api.getOperation(operationParams.id);
    getERC20Address = getActionByType(operation, ACTION_TYPE.getERC20Address);
  }

  const lockHRC20Token = getActionByType(operation, ACTION_TYPE.lockHRC20Token);

  if (lockHRC20Token && lockHRC20Token.status === STATUS.WAITING) {
    logger.pending({ prefix, message: 'lockHRC20Token' });

    let res: any;

    if (operation.network === NETWORK_TYPE.BINANCE) {
      res = await hmyMethods.lockOneBSC(
        operation.ethAddress,
        operationParams.amount,
        (hash: string) => confirmCallback(api, hash, lockHRC20Token.type, operationParams.id)
      );
    } else {
      res = await hmyMethods.lockOne(operation.ethAddress, operationParams.amount, (hash: string) =>
        confirmCallback(api, hash, lockHRC20Token.type, operationParams.id)
      );
    }

    logger.info({ prefix, message: 'Status: ' + res.status });
    logger.success({ prefix, message: 'lockHRC20Token' });
  }
  const mintHRC20Token = await waitAction(
    api,
    operationParams.id,
    ACTION_TYPE.mintHRC20Token,
    maxWaitingTime,
    prefix
  );

  if (!checkStatus(mintHRC20Token, prefix, ACTION_TYPE.mintHRC20Token)) {
    return false;
  }

  return true;
};
