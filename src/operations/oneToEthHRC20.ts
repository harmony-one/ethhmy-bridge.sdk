import { ACTION_TYPE, IOperation, STATUS } from '../interfaces';
import { logger } from '../utils/logs';
import { checkStatus, confirmCallback, getActionByType, waitAction } from '../operation-helpers';
import { sleep } from '../utils';
import { HmyMethodsHrc20Common } from '../blockchain/hmy';
import { ValidatorsAPI } from '../api';
import { EthMethodsHRC20 } from '../blockchain/eth/EthMethodsHRC20';

export const oneToEthHRC20 = async (
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

  const approveHRC20HmyManger = getActionByType(operation, ACTION_TYPE.approveHRC20HmyManger);

  if (approveHRC20HmyManger && approveHRC20HmyManger.status === STATUS.WAITING) {
    logger.pending({ prefix, message: 'approveHRC20HmyManger' });

    const tokenDetails = await hmyMethods.tokenDetails(operation.hrc20Address);

    const res: any = await hmyMethods.approveHmyManger(
      operation.hrc20Address,
      operationParams.amount,
      Number(tokenDetails.decimals),
      (hash: string) => confirmCallback(api, hash, approveHRC20HmyManger.type, operationParams.id)
    );

    logger.info({ prefix, message: 'Status: ' + res.status });
    logger.success({ prefix, message: 'approveHRC20HmyManger' });
  }

  const lockHRC20Token = getActionByType(operation, ACTION_TYPE.lockHRC20Token);

  if (lockHRC20Token && lockHRC20Token.status === STATUS.WAITING) {
    logger.pending({ prefix, message: 'lockHRC20Token' });

    const tokenDetails = await hmyMethods.tokenDetails(operation.hrc20Address);

    const res: any = await hmyMethods.lockToken(
      operation.hrc20Address,
      operation.ethAddress,
      operationParams.amount,
      Number(tokenDetails.decimals),
      (hash: string) => confirmCallback(api, hash, lockHRC20Token.type, operationParams.id)
    );

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
