import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-contract-sizer";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy";
import "@nomiclabs/hardhat-web3";
import "tsconfig-paths/register";
import "@nomiclabs/hardhat-etherscan";
// import 'hardhat-log-remover'
// import "hardhat-gas-reporter";
import { HardhatUserConfig } from "hardhat/types";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

export const config = {
  paths: {
    root: "./packages/core",
    deploy: "deploy",
    sources: "contracts",
    artifacts: "artifacts",
  },
  networks: {
    hardhat: {
      // blockGasLimit: 15000000,
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_ID}`,
      accounts: process.env.PRIVATE_KEY ? [`${process.env.PRIVATE_KEY}`] : [],
      blockGasLimit: 4000000,
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_ID}`,
      accounts: process.env.PRIVATE_KEY ? [`${process.env.PRIVATE_KEY}`] : [],
      // blockGasLimit: 4000000,
    },
    nova: {
      url: "https://nova.arbitrum.io/rpc",
      accounts: process.env.PRIVATE_KEY ? [`${process.env.PRIVATE_KEY}`] : [],
    },
  },
  etherscan: {
    apiKey: {
      goerli: "2M5WQBZ8XMJSZW9HVIUAXKAAJW2ZCZEWQW",
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.14",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1,
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
    gasPrice: 2,
    coinmarketcap: "5dc6d6fd-09c5-4c48-8296-9e2b44dde46a",
  },
  typechain: {
    outDir: "./typechain-types",
    target: "ethers-v5",
  },
  // etherscan: {
  //   apiKey: process.env.ETHERSCAN_KEY,
  // },
  // contractSizer: {
  //   alphaSort: true,
  //   runOnCompile: true,
  //   disambiguatePaths: false,
  // }
};

export default config;
