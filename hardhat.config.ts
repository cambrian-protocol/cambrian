import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-contract-sizer";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy";
import "@nomiclabs/hardhat-web3";
import "tsconfig-paths/register";
// import 'hardhat-log-remover'
// import "hardhat-gas-reporter"
import { HardhatUserConfig } from "hardhat/types";

const TESTNET_PRIVATE_KEY =
  "33b3817e6e42e55a00c425e0a081dbf3e9a8672600d6527f3d0849f9c19b91c6";

export const config = {
  paths: {
    root: "./packages/core",
    deploy: "deploy",
    sources: "contracts",
    artifacts: "artifacts",
  },
  networks: {
    hardhat: {
      blockGasLimit: 15000000,
      // allowUnlimitedContractSize: true,
    },
    wlkrnet: {
      url: `http://198.74.50.28:8000`,
      blockGasLimit: 150000000000000,
      gasPrice: 8000000000, // default is 'auto' which breaks chains without the london hardfork
      accounts: [`0x${TESTNET_PRIVATE_KEY}`],
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      { version: "0.5.17", settings: {} },
    ],
  },
  namedAccounts: {
    deployer: 0,
  },
  gasReporter: {
    currency: "USD",
    gasPrice: 32,
    coinmarketcap: "5dc6d6fd-09c5-4c48-8296-9e2b44dde46a",
  },
  typechain: {
    outDir: "./typechain-types",
    target: "ethers-v5",
  },
  // contractSizer: {
  //   alphaSort: true,
  //   runOnCompile: true,
  //   disambiguatePaths: false,
  // }
};

export default config;
