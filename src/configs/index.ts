export * from './mainnet';
export * from './testnet';

export type TConfig = {
  nodeURL: string;
  explorerURL: string;
  contracts: {
    busd: string;
    link: string;
    busdManager: string;
    linkManager: string;
    erc20Manager: string;
    erc721Manager: string;
    multisigWallet: string;
    tokenManager: string;
    hrc20Manager: string;
    ethManager: string;
    nativeTokenHRC20: string;
  };
  gasPrice?: number;
  gasLimit?: number;
};
