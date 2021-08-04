import { logger } from './utils/logs';
import { EXCHANGE_MODE, IOperation, TOKEN } from './interfaces';
import { IHmyClient } from './blockchain/hmy';
import { IWeb3Client } from './blockchain';
import { checkStatus, getEthBalance, getOneBalance, logOperationParams } from './operation-helpers';
import { ethToOne } from './operations/ethToOne';
import { oneToEth } from './operations/oneToEth';
import { oneToEthErc20 } from './operations/oneToEthErc20';
import { ethToOneErc20 } from './operations/ethToOneErc20';
import { BigNumber } from 'bignumber.js';
import { ValidatorsAPI } from './api';
import { HmyMethodsCommon } from './blockchain/hmy';
import { EthMethods } from './blockchain/eth/EthMethods';

export const operation = async (params: {
  api: ValidatorsAPI;
  web3Client: IWeb3Client;
  hmyClient: IHmyClient;
  token: TOKEN;
  type: EXCHANGE_MODE;
  amount: number;
  oneAddress: string;
  ethAddress: string;
  erc20Address?: string;
  maxWaitingTime: number;
}) => {
  const {
    api,
    oneAddress,
    ethAddress,
    web3Client,
    hmyClient,
    token,
    type,
    amount,
    erc20Address,
    maxWaitingTime,
  } = params;

  const prefix = `[${token.toUpperCase()}: ${type.toUpperCase()}]`;

  try {
    logger.start({ prefix, message: `test ${token.toUpperCase()}: ${type.toUpperCase()}` });

    const ethBalanceBefore = await getEthBalance(web3Client, hmyClient, token, erc20Address);
    const oneBalanceBefore = await getOneBalance(hmyClient, web3Client, token, erc20Address);

    const operationParams = {
      oneAddress,
      ethAddress,
      amount,
      type,
      token,
      erc20Address,
    };

    logger.info({ prefix, message: 'ONE balance before: ' + oneBalanceBefore });
    logger.info({ prefix, message: 'ETH balance before: ' + ethBalanceBefore });

    logger.pending({ prefix, message: 'create operation' });

    let operation: IOperation;
    operation = await api.createOperation(operationParams);

    logOperationParams(operation, prefix);

    logger.success({ prefix, message: 'create operation' });
    logger.info({ prefix, message: 'operation ID: ' + operation.id });

    let ethMethods: EthMethods, hmyMethods: HmyMethodsCommon;

    switch (token) {
      case TOKEN.BUSD:
        hmyMethods = hmyClient.hmyMethodsBUSD;
        ethMethods = web3Client.ethMethodsBUSD;
        break;
      case TOKEN.LINK:
        hmyMethods = hmyClient.hmyMethodsLINK;
        ethMethods = web3Client.ethMethodsLINK;
        break;
    }

    let res = false;

    if (token === TOKEN.ERC20) {
      if (type === EXCHANGE_MODE.ETH_TO_ONE) {
        res = await ethToOneErc20(
          api,
          operation,
          web3Client.ethMethodsERC20,
          hmyClient.hmyMethodsERC20,
          prefix,
          maxWaitingTime
        );
      }

      if (type === EXCHANGE_MODE.ONE_TO_ETH) {
        res = await oneToEthErc20(
          api,
          operation,
          web3Client.ethMethodsERC20,
          hmyClient.hmyMethodsERC20,
          prefix,
          maxWaitingTime
        );
      }
    } else {
      if (type === EXCHANGE_MODE.ETH_TO_ONE) {
        res = await ethToOne(api, operation, ethMethods, prefix, maxWaitingTime);
      }

      if (type === EXCHANGE_MODE.ONE_TO_ETH) {
        res = await oneToEth(api, operation, ethMethods, hmyMethods, prefix, maxWaitingTime);
      }
    }

    if (!res) {
      return false;
    }

    operation = await api.getOperation(operation.id);

    if (!checkStatus(operation, prefix, 'operation')) {
      return false;
    }

    const ethBalanceAfter = await getEthBalance(web3Client, hmyClient, token, erc20Address);
    logger.info({ prefix, message: 'ETH balance before: ' + ethBalanceBefore });
    logger.info({ prefix, message: 'ETH balance after: ' + ethBalanceAfter });

    const ethBalanceWrong =
      type === EXCHANGE_MODE.ETH_TO_ONE
        ? !new BigNumber(ethBalanceBefore).minus(operationParams.amount).isEqualTo(ethBalanceAfter)
        : !new BigNumber(ethBalanceBefore).plus(operationParams.amount).isEqualTo(ethBalanceAfter);

    if (ethBalanceWrong) {
      logger.error({ prefix, message: 'Wrong ETH balance after' });
      return false;
    } else {
      logger.success({ prefix, message: 'ETH balance after OK' });
    }

    const oneBalanceAfter = await getOneBalance(hmyClient, web3Client, token, erc20Address);
    logger.info({ prefix, message: 'ONE balance before: ' + oneBalanceBefore });
    logger.info({ prefix, message: 'ONE balance after: ' + oneBalanceAfter });

    const oneBalanceWrong =
      type === EXCHANGE_MODE.ETH_TO_ONE
        ? !new BigNumber(oneBalanceBefore).plus(operationParams.amount).isEqualTo(oneBalanceAfter)
        : !new BigNumber(oneBalanceBefore).minus(operationParams.amount).isEqualTo(oneBalanceAfter);

    if (oneBalanceWrong) {
      logger.error({ prefix, message: 'Wrong ONE balance after' });
      return false;
    } else {
      logger.success({ prefix, message: 'ONE balance after OK' });
    }

    logger.success({ prefix, message: 'operation OK' });

    return true;
  } catch (e) {
    console.log(e);

    let error;

    if (e && e.status && e.response.body) {
      error = e.response.body.message;
    } else {
      error = e ? e.message : 'unknown';
    }

    logger.error({ prefix, message: error });
    return false;
  }
};
