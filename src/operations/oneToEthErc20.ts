import { ACTION_TYPE, IOperation, STATUS, TOKEN } from '../interfaces';
import { logger } from '../utils/logs';
import { checkStatus, confirmCallback, getActionByType, waitAction } from '../operation-helpers';
import { sleep } from '../utils';
import { EthMethodsERC20 } from '../blockchain/eth/EthMethodsERC20';
import { HmyMethodsErc20Common } from '../blockchain/hmy';
import { ValidatorsAPI } from '../api';

export const oneToEthErc20 = async (
  api: ValidatorsAPI,
  operationParams: IOperation,
  ethMethods: EthMethodsERC20,
  hmyMethods: HmyMethodsErc20Common,
  prefix: string,
  maxWaitingTime: number
) => {
  let operation = await api.getOperation(operationParams.id);
  let erc20TokenDetails;
  let hrc20Address;

  if (operation.token !== TOKEN.ETH) {
    let getHRC20Action = getActionByType(operation, ACTION_TYPE.getHRC20Address);

    if (getHRC20Action) {
      logger.wait({ prefix, message: 'getHRC20Address' });
    }

    while (getHRC20Action && [STATUS.IN_PROGRESS, STATUS.WAITING].includes(getHRC20Action.status)) {
      await sleep(3000);
      operation = await api.getOperation(operationParams.id);
      getHRC20Action = getActionByType(operation, ACTION_TYPE.getHRC20Address);
    }

    hrc20Address = await hmyMethods.getMappingFor(operationParams.erc20Address);

    erc20TokenDetails = await hmyMethods.tokenDetails(hrc20Address);
  } else {
    erc20TokenDetails = { decimals: 18 };
    hrc20Address = operationParams.hrc20Address;
  }

  if (!hrc20Address) {
    throw new Error('hrc20Address not found');
  }

  const approveHmyManger = getActionByType(operation, ACTION_TYPE.approveHmyManger);

  if (approveHmyManger && approveHmyManger.status === STATUS.WAITING) {
    logger.pending({ prefix, message: 'approveHmyManger' });

    const res: any = await hmyMethods.approveHmyManger(
      hrc20Address,
      operationParams.amount,
      erc20TokenDetails.decimals,
      (hash: string) => confirmCallback(api, hash, approveHmyManger.type, operationParams.id)
    );

    logger.info({ prefix, message: 'Status: ' + res.status });
    logger.success({ prefix, message: 'approveHmyManger' });
  }

  operation = await api.getOperation(operationParams.id);

  const burnToken = getActionByType(operation, ACTION_TYPE.burnToken);

  if (burnToken && burnToken.status === STATUS.WAITING) {
    logger.pending({ prefix, message: 'burnToken' });

    const res: any = await hmyMethods.burnToken(
      hrc20Address,
      operationParams.ethAddress,
      operationParams.amount,
      erc20TokenDetails.decimals,
      (hash: string) => confirmCallback(api, hash, burnToken.type, operationParams.id)
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
