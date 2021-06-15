const { BridgeSDK, TOKEN, EXCHANGE_MODE, STATUS } = require('../../');
const configs = require('../../lib/configs');

const operationCall = async () => {
  const bridgeSDK = new BridgeSDK({ logLevel: 2 }); // 2 - full logs, 1 - only success & errors, 0 - logs off

  await bridgeSDK.init(configs.testnet);

  await bridgeSDK.addEthWallet('6a36da6f9d0c9ad9fda5ca9b29ab372441196e12cadd813fcb86f62222222222');

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
        token: TOKEN.ERC20,
        amount: 100,
        erc20Address: '0xfF4101a846D217dF67808A79d42384BC95dBD474',
        oneAddress: 'one1437j7lqq54v9ng7qqs0x7cf42tqkcz4thckwua',
        ethAddress: '0x430506383F1Ac31F5FdF5b49ADb77faC604657B2',
        network: 'BINANCE',
      },
      id => (operationId = id)
    );
  } catch (e) {
    console.log('Error: ', e.message);
  }

  process.exit();
};

operationCall();
