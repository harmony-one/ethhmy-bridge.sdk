import { AbiItem } from 'web3-utils';

const abi: AbiItem[] = [
  {
    constant: false,
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'deposit',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function',
  },
];

export default abi;
