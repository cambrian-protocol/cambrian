const { deployments } = require("hardhat");
const hre = require("hardhat");
const ethers = hre.ethers;

const ERC20_ABI =
  require("../artifacts/contracts/tokens/ToyToken.sol/ToyToken.json").abi;

async function main() {
  const [user0, user1, keeper] = await ethers.getSigners();

  // const ToyToken = new ethers.Contract(
  //   "0x0165878A594ca255338adfa4d48449f69242Eb8F",
  //   new ethers.utils.Interface(ERC20_ABI),
  //   ethers.getDefaultProvider()
  // );
  // local

  const ToyToken = new ethers.Contract(
    "0x4c7C2e0e069497D559fc74E0f53E88b5b889Ee79",
    new ethers.utils.Interface(ERC20_ABI),
    ethers.getDefaultProvider()
  );
  // ropsten

  await ToyToken.connect(user0).mint(
    "0x676d41fedD0f24f282a4579C6d0C8E3B2099f0EF",
    "1000000000000000000000"
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
