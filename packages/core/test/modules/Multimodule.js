const { ethers, deployments } = require("hardhat");
const { expect } = require("chai");
const SOLVER_ABI =
  require("../../artifacts/contracts/solvers/Solver.sol/Solver.json").abi;
const {
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");
const { FormatTypes } = require("ethers/lib/utils");

const testHelpers = require("../../helpers/testHelpers.js");
const { getBytes32FromMultihash } = require("../../helpers/multihash.js");

const ctHelpers = require("../../helpers/ConditionalTokens.js");

describe("Multiple modules", function () {
  this.beforeEach(async function () {
    const [user1, submitter, keeper, arbitrator] = await ethers.getSigners();
    this.user1 = user1;
    this.submitter = submitter;
    this.keeper = keeper;
    this.arbitrator = arbitrator;

    await deployments.fixture([
      "ConditionalTokens",
      "SolverFactory",
      "ProposalsHub",
      "ToyToken",
      "BasicSolverV1",
      "IPFSSolutionsHub",
      "IPFSTextSubmitter",
      "Unanimity",
    ]);

    this.Unanimity = await ethers.getContract("Unanimity");
    this.IPFSTextSubmitter = await ethers.getContract("IPFSTextSubmitter");
    this.SolverFactory = await ethers.getContract("SolverFactory");
    this.ToyToken = await ethers.getContract("ToyToken");
    this.BasicSolverV1 = await ethers.getContract("BasicSolverV1");
    this.ISolver = new ethers.utils.Interface(SOLVER_ABI);
    this.ISolver.format(FormatTypes.full);

    this.timelockSeconds = 1;

    this.submitterSlot = ethers.utils.formatBytes32String("submitter");

    this.conditionBase = {
      collateralToken: this.ToyToken.address,
      outcomeSlots: 2,
      parentCollectionIndexSet: 0,
      amountSlot: ethers.utils.formatBytes32String("0"),
      partition: [1, 2],
      allocations: [
        {
          recipientAddressSlot: ethers.utils.formatBytes32String("1"),
          recipientAmountSlots: [
            ethers.utils.formatBytes32String("0"),
            ethers.utils.formatBytes32String("0"),
          ],
        },
        {
          recipientAddressSlot: this.submitterSlot,
          recipientAmountSlots: [
            ethers.utils.formatBytes32String("0"),
            ethers.utils.formatBytes32String("0"),
          ],
        },
      ],
      outcomeURIs: [
        "QmYZB6LDtGqqfJyhJDEp7rgFgEVSm7H7yyXZjhvCqVkYvZ",
        "QmPrcQH4akfr7eSn4tQHmmudLdJpKhHskVJ5iqYxCks1FP",
      ],
    };

    this.ingests = [
      {
        executions: 0,
        ingestType: 1,
        slot: ethers.utils.formatBytes32String("0"),
        solverIndex: 0, // Ignored for ingestType.constant
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], ["1"]),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: ethers.utils.formatBytes32String("1"),
        solverIndex: 0, // Ignored for ingestType.constant
        data: ethers.utils.defaultAbiCoder.encode(
          ["address"],
          [this.user1.address]
        ),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: this.submitterSlot,
        solverIndex: 0, // Ignored for ingestType.constant
        data: ethers.utils.defaultAbiCoder.encode(
          ["address"],
          [this.submitter.address]
        ),
      },
    ];

    this.moduleLoaders = [
      {
        module: this.IPFSTextSubmitter.address,
        data: ethers.utils.defaultAbiCoder.encode(
          ["bytes32"],
          [this.submitterSlot]
        ),
      },
      {
        module: this.Unanimity.address,
        data: ethers.constants.HashZero,
      },
    ];

    this.solverConfigs = [
      {
        implementation: this.BasicSolverV1.address,
        keeper: this.keeper.address,
        arbitrator: this.arbitrator.address,
        timelockSeconds: this.timelockSeconds,
        moduleLoaders: this.moduleLoaders,
        ingests: this.ingests,
        conditionBase: this.conditionBase,
      },
    ];

    this.Solver = await (
      await testHelpers.deploySolverChain(
        this.solverConfigs,
        this.SolverFactory,
        this.keeper
      )
    )[0];
  });

  it("Works with both IPFSTextSubmitter and Inanimity", async function () {
    await this.Solver.connect(this.keeper).prepareSolve(0);
    await this.Solver.connect(this.keeper).executeSolve(0);

    const STATEKEY = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["address"],
        [this.IPFSTextSubmitter.address]
      )
    );

    expect(await this.Solver.getState(STATEKEY)).to.equal(
      ethers.utils.defaultAbiCoder.encode(["bytes32"], [this.submitterSlot])
    );

    expect(
      await this.IPFSTextSubmitter.submitter(this.Solver.address)
    ).to.equal(this.submitter.address);

    await this.IPFSTextSubmitter.connect(this.submitter).submit(
      this.Solver.address,
      "QmPrcQH4akfr7eSn4tQHmmudLdJpKhHskVJ5iqYxCks1FP",
      0
    );

    await expectRevert(
      this.IPFSTextSubmitter.connect(this.user1).submit(
        this.Solver.address,
        "QmPrcQH4akfr7eSn4tQHmmudLdJpKhHskVJ5iqYxCks1FP",
        0
      ),
      "Only Submitter"
    );

    await this.Solver.connect(this.keeper).proposePayouts(0, [1, 0]);
    await this.Unanimity.connect(this.user1).approveOutcome(
      this.Solver.address,
      0
    );

    expect(await this.Solver.connect(this.keeper).getStatus(0)).to.equal(2); // Outcome Proposed

    await this.Unanimity.connect(this.submitter).approveOutcome(
      this.Solver.address,
      0
    );

    expect(await this.Solver.connect(this.keeper).getStatus(0)).to.equal(5); // Outcome Reported
  });
});
