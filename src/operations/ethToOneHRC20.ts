import { ACTION_TYPE, IOperation, STATUS } from '../interfaces';
import { logger } from '../utils/logs';
import { checkStatus, confirmCallback, getActionByType, waitAction } from '../operation-helpers';
// import { sleep } from '../utils';
import { HmyMethodsHrc20Common } from '../blockchain/hmy';
import { ValidatorsAPI } from '../api';
import { EthMethodsHRC20 } from '../blockchain/eth/EthMethodsHRC20';

export const ethToOneHRC20 = async (
  api: ValidatorsAPI,
  operationParams: IOperation,
  ethMethods: EthMethodsHRC20,
  hmyMethods: HmyMethodsHrc20Common,
  prefix: string,
  maxWaitingTime: number
) => {
  let operation = await api.getOperation(operationParams.id);

  // let getERC20Address = getActionByType(operation, ACTION_TYPE.getERC20Address);
  //
  // if (getERC20Address) {
  //   logger.wait({ prefix, message: 'getERC20Address' });
  // }
  //
  // while (getERC20Address && [STATUS.IN_PROGRESS, STATUS.WAITING].includes(getERC20Address.status)) {
  //   await sleep(3000);
  //   operation = await api.getOperation(operationParams.id);
  //   getERC20Address = getActionByType(operation, ACTION_TYPE.getERC20Address);
  // }

  const erc20Address = await ethMethods.getMappingFor(operation.hrc20Address);

  // const erc20TokenDetails = await ethMethods.tokenDetails(operationParams.erc20Address);
  const erc20TokenDetails = {
    name: 'Ethereum One',
    symbol: 'ONE',
    decimals: 18,
    erc20Address: '',
  };

  const approveHRC20EthManger = getActionByType(operation, ACTION_TYPE.approveHRC20EthManger);

  if (approveHRC20EthManger && approveHRC20EthManger.status === STATUS.WAITING) {
    logger.pending({ prefix, message: 'approveHRC20EthManger' });

    const { amount } = operationParams;

    const res = await ethMethods.approveEthManger(
      erc20Address,
      amount,
      erc20TokenDetails.decimals,
      (hash: string) => confirmCallback(api, hash, approveHRC20EthManger.type, operationParams.id)
    );

    logger.info({ prefix, message: 'Status: ' + res.status });
    logger.success({ prefix, message: 'approveHRC20EthManger' });
  }

  operation = await api.getOperation(operationParams.id);

  const burnHRC20Token = getActionByType(operation, ACTION_TYPE.burnHRC20Token);

  if (burnHRC20Token && burnHRC20Token.status === STATUS.WAITING) {
    logger.pending({ prefix, message: 'burnHRC20Token' });

    const res = await ethMethods.burnToken(
      erc20Address,
      operationParams.oneAddress,
      operationParams.amount,
      erc20TokenDetails.decimals,
      (hash: string) => confirmCallback(api, hash, burnHRC20Token.type, operationParams.id)
    );

    logger.info({ prefix, message: 'Status: ' + (res ? res.status : '') });
    logger.success({ prefix, message: 'burnToken' });
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

  const unlockHRC20Token = await waitAction(
    api,
    operationParams.id,
    ACTION_TYPE.unlockHRC20Token,
    maxWaitingTime,
    prefix
  );

  if (!checkStatus(unlockHRC20Token, prefix, ACTION_TYPE.unlockHRC20Token)) {
    return false;
  }

  return true;
};
