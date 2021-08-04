const { NETWORK_TYPE } = require('../../lib/interfaces');

const { BridgeSDK, TOKEN, EXCHANGE_MODE, STATUS } = require('../..');
const configs = require('../../lib/configs');

const operationCall = async () => {
  const bridgeSDK = new BridgeSDK({ logLevel: 2 }); // 2 - full logs, 1 - only success & errors, 0 - logs off

  await bridgeSDK.init(configs.testnet);

  await bridgeSDK.addEthWallet('xxxxx');

  let operationId;

  // display operation status
  let intervalId = setInterval(async () => {
    if (operationId) {
      const operation = await bridgeSDK.api.getOperation(operationId);

      /*
      console.log(operation.status);
      console.log(
        'Action: ',
        operation.actions.filter(a => a.status === STATUS.IN_PROGRESS)
      );
      */

      if (operation.status !== STATUS.IN_PROGRESS) {
        clearInterval(intervalId);
        process.exit();
      }
    }
  }, 4000);

  try {
    await bridgeSDK.sendToken(
      {
        type: EXCHANGE_MODE.ETH_TO_ONE,
        token: TOKEN.HRC20,
        network: NETWORK_TYPE.BINANCE,
        amount: 30,
        oneAddress: 'xxxx',
        ethAddress: 'xxxx',
        hrc20Address: '0x5a7759ac1df3573692c6e6cedcf5b7aad035441e',
      },
      id => (operationId = id)
    );
  } catch (e) {
    console.log('Error: ', e.message);
  }

  process.exit();
};

operationCall();
