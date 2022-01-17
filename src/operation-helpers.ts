import { ACTION_TYPE, IAction, STATUS, TOKEN } from './interfaces';
import { logger } from './utils/logs';
import { sleep } from './utils';
import { IWeb3Client } from './blockchain/eth';
import { IHmyClient } from './blockchain/hmy';
import { divDecimals } from './blockchain/utils';
import { IOperation } from './interfaces';
import { ValidatorsAPI } from './api';

const SLEEP_TIMEOUT_MS = 3000;

export const waitAction = async (
  api: ValidatorsAPI,
  operationId: string,
  actionType: ACTION_TYPE,
  maxTimeoutSec = 300,
  prefix: string
): Promise<IAction> => {
  logger.wait({ prefix, message: `${actionType} (${maxTimeoutSec} sec)` });

  let operation = await api.getOperation(operationId);

  const getActionByType = (type: ACTION_TYPE) => operation.actions.find(a => a.type === type);

  let action = getActionByType(actionType);

  let maxTimeoutMs = maxTimeoutSec * 1000;

  while (
    maxTimeoutMs > 0 &&
    (action.status === STATUS.IN_PROGRESS || action.status === STATUS.WAITING)
  ) {
    logger.info({ prefix, message: `waiting ${actionType}` });

    operation = await api.getOperation(operation.id);
    action = getActionByType(actionType);

    await sleep(SLEEP_TIMEOUT_MS);
    maxTimeoutMs = maxTimeoutMs - SLEEP_TIMEOUT_MS;
  }

  if (maxTimeoutMs <= 0) {
    throw new Error(`${actionType} time is out (${maxTimeoutSec} sec)`);
  }

  return action;
};

export const checkStatus = (operation: { status: STATUS }, prefix: string, actionName: string) => {
  if (operation.status === STATUS.SUCCESS) {
    logger.success({ prefix, message: `${actionName} ${operation.status}` });

    return true;
  }

  if (operation.status === STATUS.ERROR) {
    logger.error({ prefix, message: `${actionName} ${operation.status}` });

    return false;
  }

  return false;
};

export const getEthBalance = async (
  web3Client: IWeb3Client,
  hmyClient: IHmyClient,
  token: TOKEN,
  address: string,
  erc20?: string
) => {
  let res = 0;
  let balance = 0;

  switch (token) {
    case TOKEN.BUSD:
      res = await web3Client.ethMethodsBUSD.checkEthBalance(address);
      return divDecimals(res, 18);
    case TOKEN.LINK:
      res = await web3Client.ethMethodsLINK.checkEthBalance(address);
      return divDecimals(res, 18);
    case TOKEN.ERC20:
      const erc20TokenDetails = await web3Client.ethMethodsERC20.tokenDetails(erc20);

      if (!erc20TokenDetails) {
        return 0;
      }

      balance = await web3Client.ethMethodsERC20.checkEthBalance(erc20, address);

      return divDecimals(balance, erc20TokenDetails.decimals);

    case TOKEN.ERC721:
      balance = await web3Client.ethMethodsERС721.checkEthBalance(erc20, address);

      return balance;

    case TOKEN.ERC1155:
      // TODO
      return 9999999999999;

    case TOKEN.ONE:
      const erc20Address = await web3Client.ethMethodsHRC20.getMappingFor(
        '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
      );

      return divDecimals(
        await web3Client.ethMethodsHRC20.checkEthBalance(erc20Address, address),
        18
      );

    case TOKEN.ETH:
      return await web3Client.getEthBalance(address);

    case TOKEN.HRC20:
      const hrc20TokenDetails = await hmyClient.hmyMethodsHRC20.tokenDetails(erc20);

      if (!hrc20TokenDetails) {
        return 0;
      }

      const erc20AddressE = await web3Client.ethMethodsHRC20.getMappingFor(erc20);

      if (!Number(erc20AddressE)) {
        return 0;
      }

      return divDecimals(
        await web3Client.ethMethodsHRC20.checkEthBalance(erc20AddressE, address),
        hrc20TokenDetails.decimals
      );
  }
};

export const getOneBalance = async (
  hmyClient: IHmyClient,
  web3Client: IWeb3Client,
  token: TOKEN,
  address: string,
  erc20?: string
) => {
  let res = 0;
  switch (token) {
    case TOKEN.BUSD:
      res = await hmyClient.hmyMethodsBUSD.checkHmyBalance(address);
      return divDecimals(res, 18);
    case TOKEN.LINK:
      res = await hmyClient.hmyMethodsLINK.checkHmyBalance(address);
    case TOKEN.ERC721:
      res = await hmyClient.hmyMethodsLINK.checkHmyBalance(address);
      return divDecimals(res, 18);
    case TOKEN.ERC1155:
      // TODO
      return divDecimals(999999999999, 18);

    case TOKEN.ERC20:
      const hrc20Address = await hmyClient.hmyMethodsERC20.getMappingFor(erc20);

      const erc20TokenDetails = await web3Client.ethMethodsERC20.tokenDetails(erc20);

      if (!Number(hrc20Address) || !erc20TokenDetails) {
        return 0;
      }

      const balance = await hmyClient.hmyMethodsERC20.checkHmyBalance(hrc20Address, address);

      return divDecimals(balance, erc20TokenDetails.decimals);

    case TOKEN.ONE:
      return divDecimals(await hmyClient.hmyMethodsBUSD.checkHmyBalance(address), 18);

    case TOKEN.ETH:
      return divDecimals(await hmyClient.hmyMethodsERC20.checkHmyBalance(erc20, address), 18);

    case TOKEN.HRC20:
      const hrc20TokenDetails = await hmyClient.hmyMethodsHRC20.tokenDetails(erc20);

      if (!hrc20TokenDetails) {
        return 0;
      }

      return divDecimals(
        await hmyClient.hmyMethodsHRC20.checkHmyBalance(erc20, address),
        hrc20TokenDetails.decimals
      );
  }
};

export const logOperationParams = (operationParams: IOperation, prefix: string) => {
  logger.info({ prefix, message: 'Operation: ' + operationParams.type });
  logger.info({ prefix, message: 'Token: ' + operationParams.token });

  if (operationParams.erc20Address) {
    logger.info({ prefix, message: 'ERC20 address: ' + operationParams.erc20Address });
  }

  logger.info({ prefix, message: 'Amount: ' + operationParams.amount });

  logger.info({ prefix, message: 'ONE address: ' + operationParams.oneAddress });
  logger.info({ prefix, message: 'ETH address: ' + operationParams.ethAddress });
};

export const getActionByType = (operation: IOperation, type: ACTION_TYPE) =>
  operation.actions.find(a => a.type === type);

export const confirmCallback = async (
  api: ValidatorsAPI,
  transactionHash: string,
  actionType: ACTION_TYPE,
  operationId: string
) => {
  await api.confirmAction({
    operationId,
    transactionHash,
    actionType,
  });
};
