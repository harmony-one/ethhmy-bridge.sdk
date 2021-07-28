const { BridgeSDK, TOKEN, EXCHANGE_MODE, NETWORK_TYPE, ACTION_TYPE } = require('../..');
const configs = require('../../lib/configs');

const operationCall = async () => {
  const bridgeSDK = new BridgeSDK({ logLevel: 2 }); // 2 - full logs, 1 - only success & errors, 0 - logs off

  await bridgeSDK.init(configs.testnet);

  bridgeSDK.addOneWallet('xxxxxx');

  try {
    const amount = 2;
    const oneAddress = 'one1437j7lqq54v9ng7qqxxxxx';
    const ethAddress = '0xDF0746aAa8f0fEd07a0xxxxx';

    const operation = await bridgeSDK.createOperation({
      type: EXCHANGE_MODE.ONE_TO_ETH,
      token: TOKEN.BUSD,
      network: NETWORK_TYPE.ETHEREUM, // NETWORK_TYPE.BINANCE
      amount,
      oneAddress,
      ethAddress,
    });

    await operation.sdk.hmyClient.hmyMethodsDeposit.deposit(
      operation.operation.actions[0].depositAmount,
      async transactionHash => {
        console.log('Deposit hash: ', transactionHash);

        await operation.confirmAction({
          actionType: ACTION_TYPE.depositOne,
          transactionHash,
        });
      }
    );

    await operation.waitActionComplete(ACTION_TYPE.depositOne);

    await operation.sdk.hmyClient.hmyMethodsBUSD.approveHmyManger(amount, async transactionHash => {
      console.log('Approve hash: ', transactionHash);

      await operation.confirmAction({
        actionType: ACTION_TYPE.approveHmyManger,
        transactionHash,
      });
    });

    await operation.waitActionComplete(ACTION_TYPE.approveHmyManger);

    await operation.sdk.hmyClient.hmyMethodsBUSD.burnToken(
      ethAddress,
      amount,
      async transactionHash => {
        console.log('burnToken hash: ', transactionHash);

        await operation.confirmAction({
          actionType: ACTION_TYPE.burnToken,
          transactionHash,
        });
      }
    );

    await operation.waitActionComplete(ACTION_TYPE.burnToken);

    await operation.waitOperationComplete();
  } catch (e) {
    console.error('Error: ', e.message || e, e.response?.body || '');
  }
};

operationCall();
