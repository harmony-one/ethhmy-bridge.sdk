const { BridgeSDK, TOKEN, EXCHANGE_MODE, NETWORK_TYPE, ACTION_TYPE } = require('../..');
const configs = require('../../lib/configs');

const operationCall = async () => {
  const bridgeSDK = new BridgeSDK({ logLevel: 2 }); // 2 - full logs, 1 - only success & errors, 0 - logs off

  await bridgeSDK.init(configs.testnet);

  bridgeSDK.addEthWallet('xxxxx');

  try {
    const amount = 0.01;
    const oneAddress = 'one1437j7lqq54v9ng7qqs0x7cfxxxx';
    const ethAddress = '0xDF0746aAa8f0fEd07a01FC2eDxxxx';

    const operation = await bridgeSDK.createOperation({
      type: EXCHANGE_MODE.ETH_TO_ONE,
      token: TOKEN.BUSD,
      network: NETWORK_TYPE.ETHEREUM, // NETWORK_TYPE.BINANCE
      amount,
      oneAddress,
      ethAddress,
    });

    await operation.sdk.ethClient.ethMethodsBUSD.approveEthManger(amount, async transactionHash => {
      await operation.confirmAction({
        actionType: ACTION_TYPE.approveEthManger,
        transactionHash,
      });
    });

    await operation.waitActionComplete(ACTION_TYPE.approveEthManger);

    await operation.sdk.ethClient.ethMethodsBUSD.lockToken(
      ethAddress,
      amount,
      async transactionHash => {
        await operation.confirmAction({
          actionType: ACTION_TYPE.lockToken,
          transactionHash,
        });
      }
    );

    await operation.waitActionComplete(ACTION_TYPE.lockToken);

    await operation.waitOperationComplete();
  } catch (e) {
    console.error('Error: ', e.message || e, e.response?.body || '');
  }
};

operationCall();
