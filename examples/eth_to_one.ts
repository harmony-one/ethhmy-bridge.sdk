const { BridgeSDK } = require('..');

const validators = [
  'https://be1.bridge.hmny.io',
  'https://be2.bridge.hmny.io',
  'https://be3.bridge.hmny.io',
];

const threshold = 2; // minimum validators number to do operation

const assetServiceUrl = 'https://be4.bridge.hmny.io'; // assets statistic service

// Start operation

const operationCall = async () => {

  const bridgeSDK = new BridgeSDK();

  await bridgeSDK.init({
    api: { validators, assetServiceUrl, threshold },
    ethPK: 'cbcf3af28e37d8b69c4ea5856f2727f57ad01d3e86bec054d71fa83fc246f35b',
    hmyPK: 'bff583bf60548e48e5fcfeb92511ef3f007ac5dd0a926a60b61c55f63098897e',
    useWallet: false,
    network: 'mainnet',
  });

  await bridgeSDK.sendToken({
    type: 'one_to_eth',
    token: 'busd',
    amount: 0.01,
  });
};

operationCall();
