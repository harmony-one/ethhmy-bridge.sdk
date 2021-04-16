require('dotenv').config();
const Web3 = require('web3');
const BN = require('bn.js');

const HMY_RPC_URL = process.env.HMY_RPC_URL;
const HMY_PRIVATE_KEY = process.env.HMY_PRIVATE_KEY;

/*
  This example demonstrates how you can send transaction, using web3.eth
 */

GAS_LIMIT = 6721900;
GAS_PRICE = 1000000000;

const web3 = new Web3(HMY_RPC_URL);

let hmyMasterAccount = web3.eth.accounts.privateKeyToAccount(HMY_PRIVATE_KEY);
web3.eth.accounts.wallet.add(hmyMasterAccount);
web3.eth.defaultAccount = hmyMasterAccount.address;

const simpleTest = async () => {
  const myAddress = web3.eth.defaultAccount;
  console.log('My address: ', myAddress);

  const balance = await web3.eth.getBalance(myAddress);

  console.log('My balance: ', balance / 1e18);

  const newAccount = web3.eth.accounts.create();

  console.log('New account created: ', newAccount.address);

  console.log('Send 0.01 ONE token to new account - start');

  // using the event emitter
  const result = await web3.eth
    .sendTransaction({
      from: myAddress,
      to: newAccount.address,
      value: 1 * 1e16,
      gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
      gasLimit: GAS_LIMIT,
    })
    .on('error', console.error);

  console.log(`Send tx: ${result.transactionHash} result: `, result.status);

  const newAddrBalance = await web3.eth.getBalance(newAccount.address);

  console.log('New account balance: ', newAddrBalance / 1e18);
};

simpleTest();
