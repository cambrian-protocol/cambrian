const { ethers, deployments } = require("hardhat");
const {
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");

const { expect } = require("chai");

const Arb_ABI =
  require("../../artifacts/contracts/BasicArbitrator.sol/BasicArbitrator.json").abi;

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

  it("Allows enabling and disabling an implementation by owner", async function () {
    // Deployability before enable should equal 0 (Null)
    expect(
      await this.ArbitratorFactory.deployable(this.BasicArbitrator.address)
    ).to.equal(0);

    // Enable implementation
    await this.ArbitratorFactory.connect(this.owner).enableImplementation(
      this.BasicArbitrator.address
    );

    // Deployability after enable should equal 1 (Enabled)
    expect(
      await this.ArbitratorFactory.deployable(this.BasicArbitrator.address)
    ).to.equal(1);

    // Disable implementation
    this.ArbitratorFactory.connect(this.owner).disableImplementation(
      await this.BasicArbitrator.address
    );

    // Deployability after enable should equal 2 (Disabled)
    expect(
      await this.ArbitratorFactory.deployable(this.BasicArbitrator.address)
    ).to.equal(2);
  });

  it("Reverts enabling and disabling an implementation by non-owner", async function () {
    await expectRevert(
      this.ArbitratorFactory.connect(this.user).enableImplementation(
        this.BasicArbitrator.address
      ),
      "Ownable: caller is not the owner"
    );

    await expectRevert(
      this.ArbitratorFactory.connect(this.user).disableImplementation(
        this.BasicArbitrator.address
      ),
      "Ownable: caller is not the owner"
    );
  });

  it("Allows creating an arbitrator for an enabled implementation", async function () {
    // Enable implementation
    await this.ArbitratorFactory.connect(this.owner).enableImplementation(
      this.BasicArbitrator.address
    );

    // Create Arbitrator
    await this.ArbitratorFactory.connect(this.user).createArbitrator(
      this.BasicArbitrator.address,
      this.initParams
    );

    const arbitrator = await this.ArbitratorFactory.arbitrators(0);
    expect(arbitrator.arbitrator).to.exist;
  });

  it("Reverts creating an arbitrator for a Null or Disabled implementation", async function () {
    // Null
    await expectRevert(
      this.ArbitratorFactory.connect(this.user).createArbitrator(
        this.BasicArbitrator.address,
        this.initParams
      ),
      "ProxyFactory::Invalid implementation address"
    );

    // Disable implementation
    await this.ArbitratorFactory.connect(this.owner).disableImplementation(
      this.BasicArbitrator.address
    );

    // Disabled
    await expectRevert(
      this.ArbitratorFactory.connect(this.user).createArbitrator(
        this.BasicArbitrator.address,
        this.initParams
      ),
      "ProxyFactory::Invalid implementation address"
    );
  });

  it("Properly initializes clones from provided initCall data", async function () {
    // Enable implementation
    await this.ArbitratorFactory.connect(this.owner).enableImplementation(
      this.BasicArbitrator.address
    );

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
    // Enable implementation
    await this.ArbitratorFactory.connect(this.owner).enableImplementation(
      this.BasicArbitrator.address
    );

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
    // Enable implementation
    await this.ArbitratorFactory.connect(this.owner).enableImplementation(
      this.BasicArbitrator.address
    );

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
