require("@nomiclabs/hardhat-waffle");
require("@typechain/hardhat")
require("hardhat-contract-sizer")
require("@nomiclabs/hardhat-ethers")
require('hardhat-deploy');
const { HardhatUserConfig } = require("hardhat/types");

const config = {
  networks: {
    hardhat: {
      blockGasLimit: 15000000,
      allowUnlimitedContractSize: true,
    },
  },
  solidity: {
    compilers: [{ version: "0.8.0", settings: {} }],
  },
  // contractSizer: {
  //   alphaSort: true,
  //   runOnCompile: true,
  //   disambiguatePaths: false,
  // }
};
export default config;