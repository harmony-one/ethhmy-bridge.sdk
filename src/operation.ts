import { logger } from './utils/logs';
import { EXCHANGE_MODE, IOperation, NETWORK_TYPE, TOKEN } from './interfaces';
import { IHmyClient } from './blockchain/hmy';
import { IWeb3Client } from './blockchain';
import { checkStatus, getEthBalance, getOneBalance, logOperationParams } from './operation-helpers';
import { ethToOne } from './operations/ethToOne';
import { oneToEth } from './operations/oneToEth';
import { oneToEthErc20 } from './operations/oneToEthErc20';
import { ethToOneErc20 } from './operations/ethToOneErc20';
import { ValidatorsAPI } from './api';
import { HmyMethodsCommon } from './blockchain/hmy';
import { EthMethods } from './blockchain/eth/EthMethods';
import { depositOne } from './operations/oneDeposit';
import { ethToOneErc721 } from './operations/ethToOneErc721';
import { oneToEthErc721 } from './operations/oneToEthErc721';

export const operation = async (
  params: {
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
    network: NETWORK_TYPE;
  },
  callback: (id: string) => void
) => {
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

    const ethBalanceBefore = await getEthBalance(web3Client, token, ethAddress, erc20Address);
    const oneBalanceBefore = await getOneBalance(
      hmyClient,
      web3Client,
      token,
      oneAddress,
      erc20Address
    );

    const operationParams = {
      oneAddress,
      ethAddress,
      amount,
      type,
      token,
      erc20Address,
      network: params.network,
    };

    logger.info({ prefix, message: 'ONE balance before: ' + oneBalanceBefore });
    logger.info({ prefix, message: 'ETH balance before: ' + ethBalanceBefore });

    logger.pending({ prefix, message: 'create operation' });

    let operation: IOperation;
    operation = await api.createOperation(operationParams);

    if (operation && callback) {
      callback(operation.id);
    }

    logOperationParams(operation, prefix);

    logger.success({ prefix, message: 'create operation' });
    logger.info({ prefix, message: 'operation ID: ' + operation.id });

    let ethMethods: EthMethods, hmyMethods: HmyMethodsCommon;

    if (type === EXCHANGE_MODE.ONE_TO_ETH) {
      await depositOne(api, operation, ethMethods, hmyClient.hmyMethodsDeposit, prefix);
    }

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
    }

    if (token === TOKEN.ERC721) {
      if (type === EXCHANGE_MODE.ETH_TO_ONE) {
        res = await ethToOneErc721(
          api,
          operation,
          web3Client.ethMethodsERС721,
          hmyClient.hmyMethodsERC20,
          prefix,
          maxWaitingTime
        );
      }

      if (type === EXCHANGE_MODE.ONE_TO_ETH) {
        res = await oneToEthErc721(
          api,
          operation,
          web3Client.ethMethodsERС721,
          hmyClient.hmyMethodsERC721,
          prefix,
          maxWaitingTime
        );
      }
    }

    if ([TOKEN.BUSD, TOKEN.LINK].includes(token)) {
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

    throw new Error(error);

    return false;
  }
};
