const { BridgeSDK, TOKEN, EXCHANGE_MODE, STATUS } = require('..');
import { ethClient, hmyClient, apiConfig } from './configs';

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
