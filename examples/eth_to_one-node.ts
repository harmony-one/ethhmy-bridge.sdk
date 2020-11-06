const { BridgeSDK, TOKEN, EXCHANGE_MODE, STATUS } = require('..');
import { ethClient, hmyClient, apiConfig } from './configs';

const operationCall = async () => {
  const bridgeSDK = new BridgeSDK();

  await bridgeSDK.init({
    api: apiConfig,
    ethClient,
    hmyClient,
  });

  await bridgeSDK.addEthWallet('1111223395a5c3c1b08639b021f2b456d1f82e4bdd14310410dffb5f1277fe1b');

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
      type: EXCHANGE_MODE.ETH_TO_ONE,
      token: TOKEN.BUSD,
      amount: 0.01,
      oneAddress: 'one133557788hq23n58h43gr4t52fa62rutx4s247sk',
      ethAddress: '0x33445583773925122E389fE2684A9A938043f475',
    },
    (id: string) => (operationId = id)
  );
};

operationCall();
