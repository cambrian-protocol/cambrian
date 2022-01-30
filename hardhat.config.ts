require("@nomiclabs/hardhat-waffle");
require("@typechain/hardhat");
require("hardhat-contract-sizer");
require("@nomiclabs/hardhat-ethers");
require("hardhat-deploy");
require("@nomiclabs/hardhat-web3");
// require('hardhat-log-remover');
// require("hardhat-gas-reporter");
import "tsconfig-paths/register";

const dotenv = require("dotenv");
dotenv.config();
const { HardhatUserConfig } = require("hardhat/types");

const WLKRNET_PRIVATE_KEY =
  "33b3817e6e42e55a00c425e0a081dbf3e9a8672600d6527f3d0849f9c19b91c6";

export const config = {
  paths: {
    root: "./packages/core",
    deploy: "./deploy",
    sources: "./contracts",
    artifacts: "./artifacts",
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
      accounts: [`0x${WLKRNET_PRIVATE_KEY}`],
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_ROPSTEN_PROJECTID}`,
      accounts: [`${process.env.CAMBRIAN_ROPSTEN_DEPLOYER_PRIVATE_KEY}`],
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
    ropstenDeployer: "0x676d41fedD0f24f282a4579C6d0C8E3B2099f0EF",
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
