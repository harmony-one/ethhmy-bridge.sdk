import { ACTION_TYPE, IOperation, STATUS } from '../interfaces';
import { logger } from '../utils/logs';
import { checkStatus, confirmCallback, getActionByType, waitAction } from '../operation-helpers';
import { sleep } from '../utils';
import { EthMethodsERC1155 } from '../blockchain/eth/EthMethodsERC1155';
import { HmyMethodsErc20Common } from '../blockchain/hmy';
import { ValidatorsAPI } from '../api';

export const ethToOneErc1155 = async (
  api: ValidatorsAPI,
  operationParams: IOperation,
  ethMethods: EthMethodsERC1155,
  hmyMethods: HmyMethodsErc20Common,
  prefix: string,
  maxWaitingTime: number
) => {
  let operation = await api.getOperation(operationParams.id);

  let getHRC20Action = getActionByType(operation, ACTION_TYPE.getERC1155Address);

  if (getHRC20Action) {
    logger.wait({ prefix, message: 'getERC1155Address' });
  }

  while (getHRC20Action && [STATUS.IN_PROGRESS, STATUS.WAITING].includes(getHRC20Action.status)) {
    await sleep(3000);
    operation = await api.getOperation(operationParams.id);
    getHRC20Action = getActionByType(operation, ACTION_TYPE.getERC1155Address);
  }

  const approveEthManger = getActionByType(operation, ACTION_TYPE.approveERC1155EthManger);

  if (approveEthManger && approveEthManger.status === STATUS.WAITING) {
    logger.pending({ prefix, message: 'approveERC1155EthManger' });

    const { erc1155Address } = operationParams;

    await ethMethods.setApprovalForAllEthManger(erc1155Address, (hash: string) =>
      confirmCallback(api, hash, approveEthManger.type, operationParams.id)
    );

    // logger.info({ prefix, message: 'Status: ' + res.status });
    logger.success({ prefix, message: 'approveERC1155EthManger' });
  }

  operation = await api.getOperation(operationParams.id);

  const lockToken = getActionByType(operation, ACTION_TYPE.lockERC1155Token);

  if (lockToken && lockToken.status === STATUS.WAITING) {
    logger.pending({ prefix, message: 'lockERC1155Token' });

    const res = await ethMethods.lockTokens(
      operationParams.erc1155Address,
      operationParams.oneAddress,
      [...operationParams.erc1155TokenId],
      [...operationParams.amount],
      (hash: string) => confirmCallback(api, hash, lockToken.type, operationParams.id)
    );

    logger.info({ prefix, message: 'Status: ' + res.status });
    logger.success({ prefix, message: 'lockERC1155Token' });
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
    ACTION_TYPE.mintERC1155Token,
    maxWaitingTime,
    prefix
  );

  if (!checkStatus(mintToken, prefix, ACTION_TYPE.mintToken)) {
    return false;
  }

  return true;
};
