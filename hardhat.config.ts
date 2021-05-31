require("@nomiclabs/hardhat-waffle");
require("@typechain/hardhat")
require("hardhat-contract-sizer")
const { HardhatUserConfig } = require("hardhat/types");

const config = {
  solidity: {
    compilers: [{ version: "0.8.0", settings: {} }],
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  }
};
export default config;