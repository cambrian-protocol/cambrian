require("@nomiclabs/hardhat-waffle");
require("@typechain/hardhat")
require("hardhat-contract-sizer")
require("@nomiclabs/hardhat-ethers")
require('hardhat-deploy');
require("@nomiclabs/hardhat-web3");
const { HardhatUserConfig } = require("hardhat/types");

const config = {
  networks: {
    hardhat: {
      blockGasLimit: 15000000,
      allowUnlimitedContractSize: true,
    },
  },
  solidity: {
    compilers: [{ version: "0.8.0", settings: {} }, { version: "0.5.17", settings: {} }],
  },
  excludeContracts: ['contracts/d2d/CtfTreasury']
  // contractSizer: {
  //   alphaSort: true,
  //   runOnCompile: true,
  //   disambiguatePaths: false,
  // }
};
export default config;