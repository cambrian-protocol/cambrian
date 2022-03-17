const { deployments } = require("hardhat");
const hre = require("hardhat");
const ethers = hre.ethers;

const ERC20_ABI =
  require("../artifacts/contracts/ToyToken.sol/ToyToken.json").abi;

async function main() {
  const [user0, user1, keeper] = await ethers.getSigners();

  const ToyToken = new ethers.Contract(
    "0x0165878A594ca255338adfa4d48449f69242Eb8F",
    new ethers.utils.Interface(ERC20_ABI),
    ethers.getDefaultProvider()
  );

  await ToyToken.connect(user0).mint(user0.address, "1000000000000000000000");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
