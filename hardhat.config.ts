require("@nomiclabs/hardhat-waffle");
require("@typechain/hardhat")
require("hardhat-contract-sizer")
require("@nomiclabs/hardhat-ethers")
require('hardhat-deploy');
require("@nomiclabs/hardhat-web3");
// require("hardhat-gas-reporter");
const { HardhatUserConfig } = require("hardhat/types");

const config = {
  networks: {
    hardhat: {
      blockGasLimit: 15000000,
      allowUnlimitedContractSize: true,
    },
  },
  solidity: {
    compilers: [{ version: "0.8.0", settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    } }, { version: "0.5.17", settings: {} }],
  },
  gasReporter: {
    currency: 'USD',
    gasPrice: 32,
    coinmarketcap: "5dc6d6fd-09c5-4c48-8296-9e2b44dde46a"
  }
  // contractSizer: {
  //   alphaSort: true,
  //   runOnCompile: true,
  //   disambiguatePaths: false,
  // }
};
export default config;