import { connectToBrowserWallet } from './helpers';
import { withDecimals } from '../utils';
import { HmyMethods } from './HmyMethods';

export class HmyMethodsDeposit extends HmyMethods {
  deposit = async (amount: number, sendTxCallback: (tx: string) => void) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (this.useOneWallet) {
          await connectToBrowserWallet(
            // @ts-ignore
            window.onewallet,
            this.hmy,
            this.hmyManagerContract.wallet,
            null,
            reject
          );
        }

        if (this.useMathWallet) {
          await connectToBrowserWallet(
            // @ts-ignore
            window.harmony,
            this.hmy,
            this.hmyManagerContract.wallet,
            null,
            reject
          );
        }

        const response = await this.hmyManagerContract.methods
          .deposit(withDecimals(amount, 18))
          .send({ ...this.options, value: withDecimals(amount, 18) })
          .on('transactionHash', sendTxCallback);

        resolve(response);
      } catch (e) {
        reject(e);
      }
    });
  };
}
