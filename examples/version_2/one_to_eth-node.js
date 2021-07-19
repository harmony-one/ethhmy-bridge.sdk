const { BridgeSDK, TOKEN, EXCHANGE_MODE, STATUS, ACTION_TYPE } = require('../..');
const configs = require('../../lib/configs');

const operationCall = async () => {
  const bridgeSDK = new BridgeSDK({ logLevel: 2 }); // 2 - full logs, 1 - only success & errors, 0 - logs off

  await bridgeSDK.init(configs.testnet);

  try {
    const operation = await bridgeSDK.createOperation({
      type: EXCHANGE_MODE.ONE_TO_ETH,
      token: TOKEN.BUSD,
      amount: 0.01,
      oneAddress: 'one1we0fmuz9wdncqljwkpgj79k49cp4jxxxx',
      ethAddress: '0xc491a4c5c762b9E9453dB0A9e6a4431xxxxx',
    });

    /********/
    // Here you need to generate and call contract methods to lock your token
    // We skipped this step in this example and will assume that you already have a successfully completed Burn Tokens transaction.
    /********/

    await operation.skipAction(ACTION_TYPE.approveHmyManger);

    await operation.confirmAction({
      actionType: ACTION_TYPE.burnToken,
      transactionHash: '0x61b125de7560069aef96530ef9430715e3807f41a71056fxxxxxx',
    });
  } catch (e) {
    console.error('Error: ', e.message, e.response?.body);
  }
};

operationCall();
