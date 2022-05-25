const { ethers, deployments } = require("hardhat");
const {
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");

const { expect } = require("chai");

const Arb_ABI =
  require("../../artifacts/contracts/arbitration/BasicArbitrator.sol/BasicArbitrator.json").abi;

describe("ArbitratorFactory", function () {
  this.beforeEach(async function () {
    const [owner, user] = await ethers.getSigners();
    this.owner = owner;
    this.user = user;

    await deployments.fixture(["ArbitratorFactory", "BasicArbitrator"]);

    this.ArbitratorFactory = await ethers.getContract("ArbitratorFactory");
    this.BasicArbitrator = await ethers.getContract("BasicArbitrator");

    this.IArb = new ethers.utils.Interface(Arb_ABI);

    this.options = {
      address: this.user.address,
      fee: ethers.utils.parseEther("0.01"),
      lapse: 42,
    };

    this.initParams = ethers.utils.defaultAbiCoder.encode(
      ["address", "uint256", "uint256"],
      [this.options.address, this.options.fee, this.options.lapse]
    );
  });

  it("Allows creating an arbitrator", async function () {
    // Create Arbitrator
    await this.ArbitratorFactory.connect(this.user).createArbitrator(
      this.BasicArbitrator.address,
      this.initParams
    );

    const arbitrator = await this.ArbitratorFactory.arbitrators(0);
    expect(arbitrator.arbitrator).to.exist;
  });

  it("Properly initializes clones from provided initCall data", async function () {
    // Create Arbitrator
    await this.ArbitratorFactory.connect(this.user).createArbitrator(
      this.BasicArbitrator.address,
      this.initParams
    );

    const arbitrator = await this.ArbitratorFactory.arbitrators(0);
    const BasicArbitrator = await ethers.getContractAt(
      "BasicArbitrator",
      arbitrator.arbitrator
    );

    expect(await BasicArbitrator.owner()).to.equal(this.options.address);
    expect(await BasicArbitrator.fee()).to.equal(this.options.fee);
    expect(await BasicArbitrator.lapse()).to.equal(this.options.lapse);
  });

  it("Properly initializes clones from provided initCall data", async function () {
    // Create Arbitrator
    await this.ArbitratorFactory.connect(this.user).createArbitrator(
      this.BasicArbitrator.address,
      this.initParams
    );

    const arbitrator = await this.ArbitratorFactory.arbitrators(0);
    const BasicArbitrator = await ethers.getContractAt(
      "BasicArbitrator",
      arbitrator.arbitrator
    );

    expect(await BasicArbitrator.owner()).to.equal(this.options.address);
    expect(await BasicArbitrator.fee()).to.equal(this.options.fee);
    expect(await BasicArbitrator.lapse()).to.equal(this.options.lapse);
  });

  it("Reverts creating clones with invalid initCall data", async function () {
    // Wrong args
    let initParams = ethers.utils.defaultAbiCoder.encode(
      ["address", "address", "address"],
      [
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
      ]
    );

    await expectRevert.unspecified(
      this.ArbitratorFactory.connect(this.user).createArbitrator(
        this.BasicArbitrator.address,
        initParams
      )
    );

    // Can't transfer owner to address(0)
    initParams = ethers.utils.defaultAbiCoder.encode(
      ["address", "uint256", "uint256"],
      [ethers.constants.AddressZero, this.options.fee, this.options.lapse]
    );

    await expectRevert.unspecified(
      this.ArbitratorFactory.connect(this.user).createArbitrator(
        this.BasicArbitrator.address,
        initParams
      )
    );
  });
});
