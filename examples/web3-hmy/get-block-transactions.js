require('dotenv').config();
const Web3 = require('web3');

const HMY_RPC_URL = process.env.HMY_RPC_URL;

const web3 = new Web3(HMY_RPC_URL);

/*
  This example demonstrates how you can find last transaction, using web3.eth
 */

const test = async () => {
  const lastBlockNumber = await web3.eth.getBlockNumber();

  console.log('Last block number: ', lastBlockNumber);

  let block = await web3.eth.getBlock(lastBlockNumber);

  console.log('Last block hash: ', block.hash);
  console.log('Last block transactions: ', block.transactions);

  // find last transaction
  console.log('Search last transaction...');

  let transactionsCount = 0;
  let blockNumber = lastBlockNumber + 1;

  while (!transactionsCount) {
    blockNumber--;
    transactionsCount = await web3.eth.getBlockTransactionCount(blockNumber);

    console.log(`block ${blockNumber}, transactions: `, transactionsCount);
  }

  block = await web3.eth.getBlock(blockNumber);

  const lastTransaction = await block.transactions[block.transactions.length - 1];

  console.log('Last transaction hash: ', lastTransaction);

  const transaction = await web3.eth.getTransaction(lastTransaction);

  console.log('Last transaction: ', JSON.stringify(transaction));
};

test();
