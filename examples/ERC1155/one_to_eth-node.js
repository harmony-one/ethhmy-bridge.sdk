const { NETWORK_TYPE } = require('../../lib/interfaces');

const { BridgeSDK, TOKEN, EXCHANGE_MODE, STATUS } = require('../..');
const configs = require('../../lib/configs');

const operationCall = async () => {
  const bridgeSDK = new BridgeSDK({ logLevel: 2 }); // 2 - full logs, 1 - only success & errors, 0 - logs off

  await bridgeSDK.init(configs.testnet);

  await bridgeSDK.addOneWallet('0xxxxxx');

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
        token: TOKEN.ERC1155,
        network: NETWORK_TYPE.ETHEREUM,
        amount: "1",
        erc1155TokenId: '1',
        erc1155Address: '0x35889EB854f5B1beB779161D565Af5921f528757',
        oneAddress: '0x430506383F1Ac31F5FdF5b49ADb77faC604657B2',
        ethAddress: '0x430506383F1Ac31F5FdF5b49ADb77faC604657B2',
      },
      id => (operationId = id)
    );
  } catch (e) {
    console.log('Error: ', e.message);
  }

  process.exit();
};

operationCall();
