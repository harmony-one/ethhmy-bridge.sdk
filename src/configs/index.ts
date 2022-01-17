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

    hrc721Manager: string;
    hrc721TokenManager: string;
    hrc1155Manager: string;
    hrc1155TokenManager: string;
    erc1155Manager: string;
    erc1155TokenManager: string;
  };
  gasPrice?: number;
  gasLimit?: number;
};
