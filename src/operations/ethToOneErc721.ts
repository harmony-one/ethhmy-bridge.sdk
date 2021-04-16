import { ACTION_TYPE, IOperation, STATUS } from '../interfaces';
import { logger } from '../utils/logs';
import { checkStatus, confirmCallback, getActionByType, waitAction } from '../operation-helpers';
import { sleep } from '../utils';
import { EthMethodsERC20 } from '../blockchain/eth/EthMethodsERC20';
import { HmyMethodsErc20Common } from '../blockchain/hmy';
import { ValidatorsAPI } from '../api';

export const ethToOneErc721 = async (
  api: ValidatorsAPI,
  operationParams: IOperation,
  ethMethods: EthMethodsERC20,
  hmyMethods: HmyMethodsErc20Common,
  prefix: string,
  maxWaitingTime: number
) => {
  let operation = await api.getOperation(operationParams.id);

  let getHRC20Action = getActionByType(operation, ACTION_TYPE.getHRC20Address);

  if (getHRC20Action) {
    logger.wait({ prefix, message: 'getHRC20Address' });
  }

  while (getHRC20Action && [STATUS.IN_PROGRESS, STATUS.WAITING].includes(getHRC20Action.status)) {
    await sleep(3000);
    operation = await api.getOperation(operationParams.id);
    getHRC20Action = getActionByType(operation, ACTION_TYPE.getHRC20Address);
  }

  const approveEthManger = getActionByType(operation, ACTION_TYPE.approveEthManger);

  if (approveEthManger && approveEthManger.status === STATUS.WAITING) {
    logger.pending({ prefix, message: 'approveHmyManger' });

    const { erc20Address } = operationParams;

    await ethMethods.setApprovalForAllEthManger(erc20Address, (hash: string) =>
      confirmCallback(api, hash, approveEthManger.type, operationParams.id)
    );

    // logger.info({ prefix, message: 'Status: ' + res.status });
    logger.success({ prefix, message: 'approveHmyManger' });
  }

  operation = await api.getOperation(operationParams.id);

  const lockToken = getActionByType(operation, ACTION_TYPE.lockToken);

  if (lockToken && lockToken.status === STATUS.WAITING) {
    logger.pending({ prefix, message: 'lockToken' });

    const res = await ethMethods.lockTokens(
      operationParams.erc20Address,
      operationParams.oneAddress,
      operationParams.amount,
      (hash: string) => confirmCallback(api, hash, lockToken.type, operationParams.id)
    );

    logger.info({ prefix, message: 'Status: ' + res.status });
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
