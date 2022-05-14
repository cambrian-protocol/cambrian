const { deployments } = require("hardhat");
const hre = require("hardhat");
const ethers = hre.ethers;

const ERC20_ABI =
  require("../artifacts/contracts/ToyToken.sol/ToyToken.json").abi;

async function main() {
  console.log(
    ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("supportsInterface(bytes4 interfaceID)")
    )
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
