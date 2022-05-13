const { ethers, deployments } = require("hardhat");
const {
  expectRevert,
  expectEvent, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");
const { getBytes32FromMultihash } = require("../../helpers/multihash.js");

const { expect } = require("chai");
const testHelpers = require("../../helpers/testHelpers.js");

const Arb_ABI =
  require("../../artifacts/contracts/BasicArbitrator.sol/BasicArbitrator.json").abi;

describe("BasicArbitrator", function () {
  this.beforeEach(async function () {
    const [
      deployer,
      arbitratorOwner,
      keeper,
      disputer0,
      disputer1,
      nonRecipient,
    ] = await ethers.getSigners();
    this.deployer = deployer;
    this.arbitratorOwner = arbitratorOwner;
    this.keeper = keeper;
    this.disputer0 = disputer0;
    this.disputer1 = disputer1;
    this.nonRecipient = nonRecipient;

    await deployments.fixture([
      "ArbitratorFactory",
      "BasicArbitrator",
      "SolverFactory",
      "ToyToken",
      "BasicSolverV1",
    ]);

    this.ToyToken = await ethers.getContract("ToyToken");
    this.SolverFactory = await ethers.getContract("SolverFactory");
    this.ArbitratorFactory = await ethers.getContract("ArbitratorFactory");
    this.BasicArbitrator = await ethers.getContract("BasicArbitrator");
    this.BasicSolverV1 = await ethers.getContract("BasicSolverV1");

    // Enable BasicArbitrator implementation
    await this.ArbitratorFactory.connect(this.deployer).enableImplementation(
      this.BasicArbitrator.address
    );

    // Get init params
    this.options = {
      address: this.arbitratorOwner.address,
      fee: ethers.utils.parseEther("0.01"),
      lapse: 0,
    };

    this.initParams = ethers.utils.defaultAbiCoder.encode(
      ["address", "uint256", "uint256"],
      [this.options.address, this.options.fee, this.options.lapse]
    );

    // Deploy a BasicArbitrator clone
    await this.ArbitratorFactory.connect(this.arbitratorOwner).createArbitrator(
      this.BasicArbitrator.address,
      this.initParams
    );

    this.Arbitrator = await ethers.getContractAt(
      "BasicArbitrator",
      (
        await this.ArbitratorFactory.arbitrators(0)
      ).arbitrator
    );

    // Solver Config
    this.timelockSeconds = 100;
    this.ingests = [
      {
        executions: 0,
        ingestType: 1,
        slot: ethers.utils.formatBytes32String("0"),
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(
          ["bytes32"],
          [ethers.utils.formatBytes32String("")]
        ),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: ethers.utils.formatBytes32String("1"),
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(
          ["address"],
          [this.disputer0.address]
        ),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: ethers.utils.formatBytes32String("2"),
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(
          ["address"],
          [this.disputer1.address]
        ),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: ethers.utils.formatBytes32String("3"),
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], [0]),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: ethers.utils.formatBytes32String("4"),
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], [10000]),
      },
    ];
    this.conditionBase = {
      collateralToken: this.ToyToken.address,
      outcomeSlots: 2,
      parentCollectionIndexSet: 0,
      amountSlot: ethers.utils.formatBytes32String("4"),
      partition: [1, 2],
      allocations: [
        {
          recipientAddressSlot: ethers.utils.formatBytes32String("1"),
          recipientAmountSlots: [
            ethers.utils.formatBytes32String("3"),
            ethers.utils.formatBytes32String("4"),
          ],
        },
        {
          recipientAddressSlot: ethers.utils.formatBytes32String("2"),
          recipientAmountSlots: [
            ethers.utils.formatBytes32String("4"),
            ethers.utils.formatBytes32String("3"),
          ],
        },
      ],
      outcomeURIs: [
        getBytes32FromMultihash(
          "QmYZB6LDtGqqfJyhJDEp7rgFgEVSm7H7yyXZjhvCqVkYvZ"
        ),
        getBytes32FromMultihash(
          "QmPrcQH4akfr7eSn4tQHmmudLdJpKhHskVJ5iqYxCks1FP"
        ),
      ],
    };
    this.solverConfigs = [
      [
        this.BasicSolverV1.address,
        this.keeper.address,
        this.Arbitrator.address,
        this.timelockSeconds,
        ethers.utils.formatBytes32String(""),
        this.ingests,
        this.conditionBase,
      ],
    ];

    const solvers = await testHelpers.deploySolverChain(
      this.solverConfigs,
      this.SolverFactory,
      this.keeper
    );

    this.Solver = solvers[0];

    this.keeperReport = [1, 0];
    this.disputeReport0 = [0, 1];
    this.disputeReport1 = [1, 1];

    this.conditionIndex = 0;

    await this.Solver.connect(this.keeper).prepareSolve(this.conditionIndex);
    await this.Solver.connect(this.keeper).executeSolve(this.conditionIndex);
    await this.Solver.connect(this.keeper).proposePayouts(
      this.conditionIndex,
      this.keeperReport
    );

    await this.Arbitrator.connect(this.disputer0).requestArbitration(
      this.Solver.address,
      this.conditionIndex,
      this.disputeReport0,
      { value: this.options.fee }
    );

    await this.Arbitrator.connect(this.disputer1).requestArbitration(
      this.Solver.address,
      this.conditionIndex,
      this.disputeReport1,
      { value: this.options.fee }
    );

    this.disputeId = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256"],
        [this.Solver.address, this.conditionIndex]
      )
    );

    this.dispute = await this.Arbitrator.getDispute(this.disputeId);
  });

  it("Requests arbitration", async function () {
    // Condition Status = Arbitration Requested
    expect((await this.Solver.conditions(this.conditionIndex)).status).to.equal(
      3
    );

    expect(this.dispute.id).to.equal(this.disputeId);
    expect(this.dispute.fee).to.equal(this.options.fee);
    expect(this.dispute.lapse).to.equal(this.options.lapse);
    expect(this.dispute.conditionIndex).to.equal(this.conditionIndex);
    expect(this.dispute.solver).to.equal(this.Solver.address);

    // First "disputer" and choice is Keeper
    expect(this.dispute.disputers[0]).to.equal(this.keeper.address);
    expect(this.dispute.choices[0].map((x) => x.toNumber())).to.deep.equal(
      this.keeperReport
    );

    // Second is the user who requested arbitration
    expect(this.dispute.disputers[1]).to.equal(this.disputer0.address);
    expect(this.dispute.choices[1].map((x) => x.toNumber())).to.deep.equal(
      this.disputeReport0
    );
    // And so on for subsequent disputers
    expect(this.dispute.disputers[2]).to.equal(this.disputer1.address);
    expect(this.dispute.choices[2].map((x) => x.toNumber())).to.deep.equal(
      this.disputeReport1
    );
  });

  it("Reverts requestArbitration from non-recipient", async function () {
    expectRevert(
      this.Arbitrator.connect(this.disputer0).requestArbitration(
        this.Solver.address,
        this.conditionIndex,
        this.disputeReport0,
        { value: this.options.fee }
      ),
      "Only recipients"
    );
  });

  it("Reverts if condition not Status.OutcomeReported", async function () {
    await this.Solver.connect(this.keeper).prepareSolve(
      this.conditionIndex + 1
    );

    expectRevert(
      this.Arbitrator.connect(this.disputer0).requestArbitration(
        this.Solver.address,
        this.conditionIndex + 1,
        this.disputeReport0,
        { value: this.options.fee }
      ),
      "Condition status invalid for arbitration"
    );
  });

  it("Adds withdrawable balance if fee is overpaid", async function () {
    const doubleFee = this.options.fee.mul(2);

    await this.Arbitrator.connect(this.disputer0).requestArbitration(
      this.Solver.address,
      this.conditionIndex,
      this.disputeReport0,
      { value: doubleFee }
    );

    expect(await this.Arbitrator.balances(this.disputer0.address)).to.equal(
      this.options.fee
    );

    await this.Arbitrator.connect(this.disputer0).withdraw();

    expect(await this.Arbitrator.balances(this.disputer0.address)).to.equal(0);
  });

  it("Reverts requestArbitration when outside timelock", async function () {
    await ethers.provider.send("evm_increaseTime", [this.timelockSeconds]);
    await ethers.provider.send("evm_mine");

    expectRevert(
      this.Arbitrator.connect(this.nonRecipient).requestArbitration(
        this.Solver.address,
        this.conditionIndex,
        this.disputeReport0,
        { value: this.options.fee }
      ),
      "Timelock elapsed"
    );
  });

  it("Reverts arbitrateNull for non-Owner", async function () {
    expectRevert(
      this.Arbitrator.connect(this.nonRecipient).arbitrateNull(this.disputeId),
      "Ownable: caller is not the owner"
    );
  });

  it("arbitrateNull sets condition status to OutcomeProposed (2)", async function () {
    await this.Arbitrator.connect(this.arbitratorOwner).arbitrateNull(
      this.disputeId
    );

    expect((await this.Solver.condition(this.conditionIndex)).status).to.equal(
      2
    );
  });

  it("arbitrateNull resets dispute choices/disputers", async function () {
    await this.Arbitrator.connect(this.arbitratorOwner).arbitrateNull(
      this.disputeId
    );

    const dispute = await this.Arbitrator.getDispute(this.disputeId);

    expect(dispute.disputers).to.deep.equal([]);
    expect(dispute.choices).to.deep.equal([]);
  });

  it("arbitrateNull reimburses balances", async function () {
    await this.Arbitrator.connect(this.arbitratorOwner).arbitrateNull(
      this.disputeId
    );

    expect(await this.Arbitrator.balances(this.keeper.address)).to.equal(0);
    expect(
      await this.Arbitrator.balances(this.arbitratorOwner.address)
    ).to.equal(0);
    expect(await this.Arbitrator.balances(this.disputer0.address)).to.equal(
      this.options.fee
    );
    expect(await this.Arbitrator.balances(this.disputer1.address)).to.equal(
      this.options.fee
    );
  });

  it("arbitrate sets payout to choice & condition status to ArbitrationDelivered (4)", async function () {
    await ethers.provider.send("evm_increaseTime", [this.timelockSeconds * 2]);
    await ethers.provider.send("evm_mine");

    await this.Arbitrator.connect(this.arbitratorOwner).arbitrate(
      this.disputeId,
      0 // Keeper's choice
    );

    const condition = await this.Solver.condition(this.conditionIndex);
    expect(condition.status).to.equal(4);
    expect(condition.payouts.map((x) => x.toNumber())).to.deep.equal(
      this.keeperReport
    );
  });

  it("arbitrate imburses owner and winners", async function () {
    await ethers.provider.send("evm_increaseTime", [this.timelockSeconds * 2]);
    await ethers.provider.send("evm_mine");

    await this.Arbitrator.connect(this.arbitratorOwner).arbitrate(
      this.disputeId,
      1 // Disputer0's choice
    );

    expect(await this.Arbitrator.balances(this.disputer0.address)).to.equal(
      this.options.fee
    );

    expect(
      await this.Arbitrator.balances(this.arbitratorOwner.address)
    ).to.equal(this.options.fee);

    expect(await this.Arbitrator.balances(this.disputer0.address)).to.equal(
      this.options.fee
    );

    expect(await this.Arbitrator.balances(this.keeper.address)).to.equal(0);
  });

  it("Extends lapse time for a dispute", async function () {
    await ethers.provider.send("evm_increaseTime", [this.timelockSeconds * 2]);
    await ethers.provider.send("evm_mine");

    expect(await this.Arbitrator.isLapsed(this.disputeId)).to.equal(true);

    await this.Arbitrator.connect(this.arbitratorOwner).extendLapse(
      this.disputeId,
      this.timelockSeconds * 10
    );

    expect(await this.Arbitrator.isLapsed(this.disputeId)).to.equal(false);

    await ethers.provider.send("evm_increaseTime", [this.timelockSeconds * 20]);
    await ethers.provider.send("evm_mine");

    expect(await this.Arbitrator.isLapsed(this.disputeId)).to.equal(true);
  });
});
