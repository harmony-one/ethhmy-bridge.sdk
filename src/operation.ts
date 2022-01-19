import { logger } from './utils/logs';
import { EXCHANGE_MODE, IOperation, NETWORK_TYPE, TOKEN } from './interfaces';
import { HmyMethodsCommon, IHmyClient } from './blockchain/hmy';
import { IWeb3Client } from './blockchain';
import { checkStatus, logOperationParams } from './operation-helpers';

import {
  depositOne,
  ethToOne,
  ethToOneErc20,
  ethToOneErc721,
  ethToOneErc1155,
  oneToEthErc1155,
  ethToOneETH,
  ethToOneHRC20,
  ethToOneONE,
  oneToEth,
  oneToEthErc20,
  oneToEthErc721,
  oneToEthHRC20,
  oneToEthONE,
} from './operations';

import { ValidatorsAPI } from './api';
import { EthMethods } from './blockchain/eth/EthMethods';

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
    hrc20Address?: string;
    maxWaitingTime: number;
    network: NETWORK_TYPE;
    erc1155Address?: string;
    hrc721Address?: string;
    hrc1155Address?: string;
    hrc1155TokenId?: any;
    erc1155TokenId?: any;
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
    hrc20Address,
    maxWaitingTime,
    erc1155Address,
    hrc721Address,
    hrc1155Address,
    hrc1155TokenId,
    erc1155TokenId,
  } = params;

  const prefix = `[${token.toUpperCase()}: ${type.toUpperCase()}]`;

  try {
    logger.start({ prefix, message: `test ${token.toUpperCase()}: ${type.toUpperCase()}` });

    // const ethBalanceBefore = await getEthBalance(
    //   web3Client,
    //   hmyClient,
    //   token,
    //   ethAddress,
    //   erc20Address || hrc20Address
    // );
    // const oneBalanceBefore = await getOneBalance(
    //   hmyClient,
    //   web3Client,
    //   token,
    //   oneAddress,
    //   erc20Address || hrc20Address
    // );

    const operationParams = {
      oneAddress,
      ethAddress,
      amount,
      type,
      token,
      erc20Address,
      hrc20Address,
      network: params.network,
      erc1155Address,
      hrc721Address,
      hrc1155Address,
      hrc1155TokenId,
      erc1155TokenId,
    };

    // logger.info({ prefix, message: 'ONE balance before: ' + oneBalanceBefore });
    // logger.info({ prefix, message: 'ETH balance before: ' + ethBalanceBefore });

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
          operation.network === NETWORK_TYPE.BINANCE
            ? hmyClient.hmyMethodsERC20BSC
            : hmyClient.hmyMethodsERC20,
          prefix,
          maxWaitingTime
        );
      }
    }

    if (token === TOKEN.ONE) {
      if (type === EXCHANGE_MODE.ETH_TO_ONE) {
        res = await ethToOneONE(
          api,
          operation,
          web3Client.ethMethodsHRC20,
          hmyClient.hmyMethodsHRC20,
          prefix,
          maxWaitingTime
        );
      }

      if (type === EXCHANGE_MODE.ONE_TO_ETH) {
        res = await oneToEthONE(
          api,
          operation,
          web3Client.ethMethodsHRC20,
          operation.network === NETWORK_TYPE.BINANCE
            ? hmyClient.hmyMethodsHRC20BSC
            : hmyClient.hmyMethodsHRC20,
          prefix,
          maxWaitingTime
        );
      }
    }

    if (token === TOKEN.HRC20) {
      if (type === EXCHANGE_MODE.ETH_TO_ONE) {
        res = await ethToOneHRC20(
          api,
          operation,
          web3Client.ethMethodsHRC20,
          hmyClient.hmyMethodsHRC20,
          prefix,
          maxWaitingTime
        );
      }

      if (type === EXCHANGE_MODE.ONE_TO_ETH) {
        res = await oneToEthHRC20(
          api,
          operation,
          web3Client.ethMethodsHRC20,
          operation.network === NETWORK_TYPE.BINANCE
            ? hmyClient.hmyMethodsHRC20BSC
            : hmyClient.hmyMethodsHRC20,
          prefix,
          maxWaitingTime
        );
      }
    }

    if (token === TOKEN.ETH) {
      if (type === EXCHANGE_MODE.ETH_TO_ONE) {
        res = await ethToOneETH(
          api,
          operation,
          web3Client.ethMethodsNative,
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
          operation.network === NETWORK_TYPE.BINANCE
            ? hmyClient.hmyMethodsERC20BSC
            : hmyClient.hmyMethodsERC20,
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

    if (token === TOKEN.ERC1155) {
      if (type === EXCHANGE_MODE.ETH_TO_ONE) {
        res = await ethToOneErc1155(
          api,
          operation,
          web3Client.ethMethodsERC1155,
          hmyClient.hmyMethodsERC20,
          prefix,
          maxWaitingTime
        );
      }

      if (type === EXCHANGE_MODE.ONE_TO_ETH) {
        res = await oneToEthErc1155(
          api,
          operation,
          web3Client.ethMethodsERC1155,
          hmyClient.hmyMethodsERC1155,
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
