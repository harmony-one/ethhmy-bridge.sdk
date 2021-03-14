import { AbiItem } from 'web3-utils';

const abi: AbiItem[] = [
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: 'ethTokenAddr',
        type: 'address',
      },
      {
        internalType: 'uint256[]',
        name: 'tokenIds',
        type: 'uint256[]',
      },
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
    ],
    name: 'lockTokens',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export default abi;
