import { TConfig } from './index';

const api = {
  validators: [
    'https://be1.bridge.hmny.io',
    'https://marsinitiative.one',
    'https://harmony.kratosvalidator.com',
  ],
  threshold: 1, // minimum validators number to do operation
  assetServiceUrl: 'https://be4.bridge.hmny.io', // assets statistic service
};

const binanceClient: TConfig = {
  nodeURL: 'https://bsc-dataseed.binance.org/',
  // nodeURL: 'https://bsc-dataseed1.defibit.io',
  explorerURL: 'https://bscscan.com/',
  contracts: {
    multisigWallet: '0x715CdDa5e9Ad30A0cEd14940F9997EE611496De6',

    erc20Manager: '0xfD53b1B4AF84D59B20bF2C20CA89a6BeeAa2c628',
    hrc20Manager: '0xfD53b1B4AF84D59B20bF2C20CA89a6BeeAa2c628',
    ethManager: '0xfD53b1B4AF84D59B20bF2C20CA89a6BeeAa2c628',

    tokenManager: '0xfE601dE9D4295274b9904D5a9Ad7069F23eE2B32',
    nativeTokenHRC20: '0xb1f6E61E1e113625593a22fa6aa94F8052bc39E0',

    busd: '0xa011471158D19854aF08A22839f81321309D4A12',
    busdManager: '0xCC93449c89e8064124FFe1E9d3A84398b4f90ebd',
    link: '0xFEFB4061d5c4F096D29e6ac8e300314b5F00199c',
    linkManager: '0x9EDC8d0Bde1Fc666831Bda1ded5B34A45f9E886C',
    erc721Manager: '0x426A61A2127fDD1318Ec0EdCe02474f382FdAd30',
  },
  gasPrice: 12000000000,
  gasLimit: 1000000,
};

const ethClient: TConfig = {
  nodeURL: 'https://mainnet.infura.io/v3/acb534b53d3a47b09d7886064f8e51b6',
  explorerURL: 'https://etherscan.io/',
  contracts: {
    busd: '0x4fabb145d64652a948d72533023f6e7a623c7c53',
    link: '0x514910771af9ca656af840dff83e8264ecf986ca',
    busdManager: '0xfD53b1B4AF84D59B20bF2C20CA89a6BeeAa2c628',
    linkManager: '0xfE601dE9D4295274b9904D5a9Ad7069F23eE2B32',
    erc20Manager: '0x2dCCDB493827E15a5dC8f8b72147E6c4A5620857',
    erc721Manager: '0x426A61A2127fDD1318Ec0EdCe02474f382FdAd30',
    multisigWallet: '0x715CdDa5e9Ad30A0cEd14940F9997EE611496De6',
    hrc20Manager: '0x4D34E61CaF7A3622759D69e48CCDeB8dee5021e8',
    tokenManager: '0x1Bd0029385F95AD2584cDFaf5C19F3F20651dEf6',
    ethManager: '0xF9Fb1c508Ff49F78b60d3A96dea99Fa5d7F3A8A6',
    nativeTokenHRC20: '0x6983D1E6DEf3690C4d616b13597A09e6193EA013',
  },
  gasPrice: 100000000000,
  gasLimit: 150000,
};

const hmyClient = {
  nodeURL: 'https://api.s0.t.hmny.io',
  chainId: 1,
  contracts: {
    busd: '0xe176ebe47d621b984a73036b9da5d834411ef734',
    link: '0x218532a12a389a4a92fc0c5fb22901d1c19198aa',
    busdManager: '0x05d11b7082d5634e0318d818a2f0cd381b371ea5',
    linkManager: '0xc0c7b147910ef11f6454dc1918ecde9a2b64a3a8',
    erc20Manager: '0x2fbbcef71544c461edfc311f42e3583d5f9675d1',
    erc721Manager: '0x39ec213272dda1f46424726bb20d82c3861568c0',
    depositManager: '0xce3110e4ab757672b0535a9c1410fed80647b693',

    hrc20Manager: '0x38092d17d3641b6fa49668775948af71b430765e',
    hrc20BSCManager: '0x38092d17d3641b6fa49668775948af71b430765e',
  },
};

export const mainnet = {
  api,
  ethClient,
  hmyClient,
  binanceClient,
};
