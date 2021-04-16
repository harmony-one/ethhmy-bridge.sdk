import { withDecimals } from '../utils';
import { HmyMethodsWeb3 } from './HmyMethodsWeb3';
const BN = require('bn.js');

export class HmyMethodsDepositWeb3 extends HmyMethodsWeb3 {
  deposit = async (amount: number, sendTxCallback: (tx: string) => void) => {
    let accounts;
    if (this.useMetamask) {
      // @ts-ignore
      accounts = await ethereum.enable();
    }

    const res = await this.hmyManagerContract.methods
      .deposit(withDecimals(amount, 18))
      .send({
        from: accounts[0],
        gasLimit: process.env.GAS_LIMIT,
        gasPrice: new BN(await this.web3.eth.getGasPrice()).mul(new BN(1)),
        value: withDecimals(amount, 18),
      })
      .on('transactionHash', sendTxCallback);

    return res;
  };
}
