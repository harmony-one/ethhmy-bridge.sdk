const { BridgeSDK, TOKEN, EXCHANGE_MODE, STATUS } = require('..');
const configs = require('../lib/configs');

const operationCall = async () => {
  const bridgeSDK = new BridgeSDK({ logLevel: 2 }); // 2 - full logs, 1 - only success & errors, 0 - logs off

  await bridgeSDK.init({ ...configs.testnet, sdk: 'web3' });

  await bridgeSDK.addOneWallet(
    '0x936224fc6acd1d8e4dab100c054ed7305acf520207b2f0c15257d570d5fd56de'
  );

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
        type: EXCHANGE_MODE.ONE_TO_ETH,
        token: TOKEN.BUSD,
        amount: 4,
        oneAddress: 'one1tfyx5rc3rn8lnh8h8hmhvrw7s6xmawurdyjyt5',
        // ethAddress: '0xc491a4c5c762b9E9453dB0A9e6a4431057a5fE54',
        ethAddress: '0x430506383F1Ac31F5FdF5b49ADb77faC604657B2',
        erc20Address: '0x3b1416A2d2A4F720E5dF92873d563BAd400c8Bed',
      },
      id => (operationId = id)
    );
  } catch (e) {
    console.log('Error: ', e.message);
  }

  process.exit();
};

operationCall();
