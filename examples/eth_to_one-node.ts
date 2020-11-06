const { BridgeSDK, TOKEN, EXCHANGE_MODE } = require('..');

const apiConfig = {
  validators: [
    'https://be1.bridge.hmny.io',
    'https://be2.bridge.hmny.io',
    'https://be3.bridge.hmny.io',
  ],
  threshold: 2, // minimum validators number to do operation
  assetServiceUrl: 'https://be4.bridge.hmny.io', // assets statistic service
};

const ethClient = {
  nodeURL: 'https://mainnet.infura.io/v3/acb534b53d3a47b09d7886064f8e51b6',
  contracts: {
    busd: '0x4fabb145d64652a948d72533023f6e7a623c7c53',
    link: '0x514910771af9ca656af840dff83e8264ecf986ca',
    busdManager: '0xfD53b1B4AF84D59B20bF2C20CA89a6BeeAa2c628',
    linkManager: '0xfE601dE9D4295274b9904D5a9Ad7069F23eE2B32',
    erc20Manager: '0x2dCCDB493827E15a5dC8f8b72147E6c4A5620857',
  },
};

const hmyClient = {
  nodeURL: 'https://api.s0.t.hmny.io',
  chainId: 1,
  contracts: {
    busd: '0xe176ebe47d621b984a73036b9da5d834411ef734',
    link: '0x218532a12a389a4a92fc0c5fb22901d1c19198aa',
    busdManager: '0x05d11b7082d5634e0318d818a2f0cd381b371ea5',
    linkManager: '0xc0c7b147910ef11f6454dc1918ecde9a2b64a3a8',
    erc20Manager: '0x2fbbcef71544c461edfc311f42e3583d5f9675d1',
  },
};

const operationCall = async () => {
  const bridgeSDK = new BridgeSDK();

  await bridgeSDK.init({
    api: apiConfig,
    ethClient,
    hmyClient,
  });

  await bridgeSDK.addEthWallet('07b50f1498a5c3c1b08639b021f2b385d1f82e4bdd14312210dffb5f1277fe1b');

  await bridgeSDK.sendToken({
    type: EXCHANGE_MODE.ETH_TO_ONE,
    token: TOKEN.BUSD,
    amount: 0.01,
    oneAddress: 'one11234dzthq23n58h43gr4t52fa62rutx4s247sk',
    ethAddress: '0x12344Ab6773925122E389fE2684A9A938043f475',
  });
};

operationCall();
