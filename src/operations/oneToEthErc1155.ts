import { ACTION_TYPE, IOperation, STATUS } from '../interfaces';
import { logger } from '../utils/logs';
import { checkStatus, confirmCallback, getActionByType, waitAction } from '../operation-helpers';
import { sleep } from '../utils';
import { HmyMethodsERC1155Common } from '../blockchain/hmy';
import { ValidatorsAPI } from '../api';
import { EthMethodsERC1155 } from '../blockchain/eth/EthMethodsERC1155';

export const oneToEthErc1155 = async (
  api: ValidatorsAPI,
  operationParams: IOperation,
  ethMethods: EthMethodsERC1155,
  hmyMethods: HmyMethodsERC1155Common,
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

  const hrc1155Address = await hmyMethods.getMappingFor(operationParams.erc1155Address);

  if (!hrc1155Address) {
    throw new Error('hrc1155Address not found');
  }

  const approveHmyManger = getActionByType(operation, ACTION_TYPE.approveERC1155HmyManger);

  if (approveHmyManger && approveHmyManger.status === STATUS.WAITING) {
    logger.pending({ prefix, message: 'approveERC1155HmyManger' });

    const res: any = await hmyMethods.setApprovalForAll(hrc1155Address, (hash: string) =>
      confirmCallback(api, hash, approveHmyManger.type, operationParams.id)
    );

    logger.info({ prefix, message: 'Status: ' + res && res.status });
    logger.success({ prefix, message: 'approveERC1155HmyManger' });
  }

  operation = await api.getOperation(operationParams.id);

  const burnToken = getActionByType(operation, ACTION_TYPE.burnERC1155Token);

  if (burnToken && burnToken.status === STATUS.WAITING) {
    logger.pending({ prefix, message: 'burnERC1155Token' });

    const res: any = await hmyMethods.burnTokens(
      hrc1155Address,
      operationParams.ethAddress,
      [...operationParams.erc1155TokenId],
      [...operationParams.amount],
      (hash: string) => confirmCallback(api, hash, burnToken.type, operationParams.id)
    );

    logger.info({ prefix, message: 'Status: ' + res.status });
    logger.success({ prefix, message: 'burnERC1155Token' });
  }

  const unlockToken = await waitAction(
    api,
    operationParams.id,
    ACTION_TYPE.unlockERC1155Token,
    maxWaitingTime,
    prefix
  );

  if (!checkStatus(unlockToken, prefix, ACTION_TYPE.unlockToken)) {
    return false;
  }

  return true;
};
