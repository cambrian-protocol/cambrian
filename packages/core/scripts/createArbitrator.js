const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  const [owner] = await ethers.getSigners();
  this.owner = owner;

  this.ArbitratorFactory = await ethers.getContract("ArbitratorFactory");
  this.BasicArbitrator = await ethers.getContract("BasicArbitrator");

  this.options = {
    address: this.owner.address,
    fee: ethers.utils.parseEther("0.0001"),
    lapse: 42,
  };

  this.initParams = ethers.utils.defaultAbiCoder.encode(
    ["address", "uint256", "uint256"],
    [this.options.address, this.options.fee, this.options.lapse]
  );

  await this.ArbitratorFactory.connect(this.owner).enableImplementation(
    this.BasicArbitrator.address
  );

  await this.ArbitratorFactory.connect(this.owner).createArbitrator(
    this.BasicArbitrator.address,
    this.initParams
  );

  const arbitrator = await this.ArbitratorFactory.arbitrators(0);

  console.log("Arbitrator deployed to: ", arbitrator.arbitrator);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
