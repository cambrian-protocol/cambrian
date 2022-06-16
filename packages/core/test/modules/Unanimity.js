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

describe("Unanimity", function () {
  this.beforeEach(async function () {
    const [user1, user2, keeper, arbitrator] = await ethers.getSigners();
    this.user1 = user1;
    this.user2 = user2;
    this.keeper = keeper;
    this.arbitrator = arbitrator;

    await deployments.fixture([
      "ConditionalTokens",
      "SolverFactory",
      "ProposalsHub",
      "ToyToken",
      "BasicSolverV1",
      "IPFSSolutionsHub",
      "Unanimity",
    ]);

    this.Unanimity = await ethers.getContract("Unanimity");
    this.SolverFactory = await ethers.getContract("SolverFactory");
    this.ToyToken = await ethers.getContract("ToyToken");
    this.BasicSolverV1 = await ethers.getContract("BasicSolverV1");
    this.ISolver = new ethers.utils.Interface(SOLVER_ABI);
    this.ISolver.format(FormatTypes.full);

    this.timelockSeconds = 1;
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
          recipientAddressSlot: ethers.utils.formatBytes32String("1"),
          recipientAmountSlots: [
            ethers.utils.formatBytes32String("0"),
            ethers.utils.formatBytes32String("0"),
          ],
        },
        {
          recipientAddressSlot: ethers.utils.formatBytes32String("2"),
          recipientAmountSlots: [
            ethers.utils.formatBytes32String("0"),
            ethers.utils.formatBytes32String("0"),
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
        slot: ethers.utils.formatBytes32String("2"),
        solverIndex: 0, // Ignored for ingestType.constant
        data: ethers.utils.defaultAbiCoder.encode(
          ["address"],
          [this.user2.address]
        ),
      },
    ];

    this.moduleLoaders = [
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

  it("Allows confirming outcome if all recipients agree", async function () {
    await this.Solver.connect(this.keeper).prepareSolve(0);
    await this.Solver.connect(this.keeper).executeSolve(0);
    await this.Solver.connect(this.keeper).proposePayouts(0, [1, 0]);

    await this.Unanimity.connect(this.user1).approveOutcome(
      this.Solver.address,
      0
    );

    expectRevert(
      this.Unanimity.connect(this.user1).approveOutcome(this.Solver.address, 0),
      "Already approved"
    );

    expect(await this.Solver.connect(this.keeper).getStatus(0)).to.equal(2); // Outcome Proposed

    await this.Unanimity.connect(this.user2).approveOutcome(
      this.Solver.address,
      0
    );

    expect(await this.Solver.connect(this.keeper).getStatus(0)).to.equal(5); // Outcome Reported
  });
});
