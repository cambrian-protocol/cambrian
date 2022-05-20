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

describe("IPFSTextSubmitter", function () {
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
    ]);

    this.IPFSTextSubmitter = await ethers.getContract("IPFSTextSubmitter");
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
      partition: [0, 0],
      allocations: [
        {
          recipientAddressSlot: ethers.utils.formatBytes32String("0"),
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

    this.submitterSlot = ethers.utils.formatBytes32String("submitter");

    this.ingests = [
      {
        executions: 0,
        ingestType: 1,
        slot: ethers.utils.formatBytes32String("0"),
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

  it("Works", async function () {
    await this.Solver.connect(this.keeper).prepareSolve(0);

    const SUBMITTER_SLOT_STATE_KEY = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["address", "string"],
        [this.IPFSTextSubmitter.address, "SUBMITTER_SLOT_STATE_KEY"]
      )
    );

    expect(await this.Solver.getState(SUBMITTER_SLOT_STATE_KEY)).to.equal(
      ethers.utils.defaultAbiCoder.encode(["bytes32"], [this.submitterSlot])
    );

    expect(
      await this.IPFSTextSubmitter.submitter(this.Solver.address)
    ).to.equal(this.submitter.address);
  });
});
