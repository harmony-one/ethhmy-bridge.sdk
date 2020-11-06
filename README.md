# Horizon Bridge SDK

### Install instructions

```
npm i bridge-sdk --save
```

## How to use

### 1. Init SDK instance

```
const { BridgeSDK, TOKEN, EXCHANGE_MODE, STATUS } = require('bridge-sdk');

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

const bridgeSDK = new BridgeSDK();

await bridgeSDK.init({
  api: apiConfig,
  ethClient,
  hmyClient,
});
```

### 2. Set user wallet (NodeJS mode)
#### For ONE -> ETH operation you need to add ONE wallet:
```
await bridgeSDK.addOneWallet('bff5443377958e48e5fcfeb92511ef3f007ac5dd0a926a60b61c55f63098897e');
```

#### For ETH -> ONE operation you need to add Ethereum wallet:
```
await bridgeSDK.addEthWallet('1111223395a5c3c1b08639b021f2b456d1f82e4bdd14310410dffb5f1277fe1b');
```

### 2.1. Set user wallet (Browser mode)
#### If you use Browser you can sign transactions with Metamask or OneWallet


### 3. Create operation

```
let oprationId;

await bridgeSDK.sendToken({
  type: EXCHANGE_MODE.ETH_TO_ONE,
  token: TOKEN.BUSD,
  amount: 0.01,
  oneAddress: 'one11234dzthq23n58h43gr4t52fa62rutx4s247sk',
  ethAddress: '0x12344Ab6773925122E389fE2684A9A938043f475',
}, (id) => oprationId = id);
```

### 4. Get operation details

```
const operation = await bridgeSDK.api.getOperation(operationId);
```

### Full Eth -> One example

```
const { BridgeSDK, TOKEN, EXCHANGE_MODE, STATUS } = require('bridge-sdk');
const { ethClient, hmyClient, apiConfig } = require('./configs');

const operationCall = async () => {
  const bridgeSDK = new BridgeSDK();

  await bridgeSDK.init({
    api: apiConfig,
    ethClient,
    hmyClient,
  });

  await bridgeSDK.addOneWallet('bff5443377958e48e5fcfeb92511ef3f007ac5dd0a926a60b61c55f63098897e');

  let operationId: string;

  // display operation status
  setInterval(async () => {
    if (operationId) {
      const operation = await bridgeSDK.api.getOperation(operationId);

      console.log(operation.status);
      console.log(
        'Action: ',
        operation.actions.filter((a: any) => a.status === STATUS.IN_PROGRESS)
      );
    }
  }, 3000);

  await bridgeSDK.sendToken(
    {
      type: EXCHANGE_MODE.ONE_TO_ETH,
      token: TOKEN.BUSD,
      amount: 0.01,
      oneAddress: 'one1sh446677883n58h43gr4t52fa62rutx4s247sk',
      ethAddress: '0x21514Ab67739233445567fE2684A9A938043f475',
    },
    (id: string) => (operationId = id)
  );
};

operationCall();
```

### You can see more examples here
https://github.com/harmony-one/ethhmy-bridge.sdk/tree/main/examples


## More API methods

### getOperations
```
const operations = await bridgeSDK.api.getOperations({ size: 50, page: 0 });
```
