const { BridgeSDK } = require('..');
const configs = require('../lib/configs');

const operationCall = async () => {
  const bridgeSDK = new BridgeSDK({ logLevel: 0 });

  await bridgeSDK.init(configs.testnet);

  // get operations
  const operations = await bridgeSDK.api.getOperations({ size: 50, page: 0 });

  console.log('Operations totalElements: ', operations.totalElements);

  // get operation by id
  const operationId = operations.content[0].id;
  const operation = await bridgeSDK.api.getOperation(operationId);

  console.log('Operation details: ', operation);

  const tokens = await bridgeSDK.api.getTokensInfo();

  console.log('Tokens', tokens);
};

operationCall();
