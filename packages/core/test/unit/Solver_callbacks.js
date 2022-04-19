const { ethers, deployments } = require("hardhat");
const { expect } = require("chai");
const SOLVER_ABI =
  require("../../artifacts/contracts/Solver.sol/Solver.json").abi;
const {
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");
const { FormatTypes } = require("ethers/lib/utils");

const testHelpers = require("../../helpers/testHelpers.js");
const { getBytes32FromMultihash } = require("../../helpers/multihash.js");

const ctHelpers = require("../../helpers/ConditionalTokens.js");

describe("Solver.sol | callbacks", function () {
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
    ]);

    this.SolverFactory = await ethers.getContract("SolverFactory");
    this.ToyToken = await ethers.getContract("ToyToken");
    this.Solver = await ethers.getContract("BasicSolverV1");
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
  });

  it("Reverts when non-Solver calls registerOutgoingCallback", async function () {
    const solverConfigs = [
      {
        implementation: this.Solver.address,
        keeper: this.keeper.address,
        arbitrator: this.arbitrator.address,
        timelockSeconds: this.timelockSeconds,
        data: ethers.utils.formatBytes32String(""),
        ingests: [],
        conditionBase: this.conditionBase,
      },
    ];

    const solvers = await testHelpers.deploySolverChain(
      solverConfigs,
      this.SolverFactory,
      this.keeper
    );

    return expectRevert(
      solvers[0]
        .connect(this.keeper)
        .registerOutgoingCallback(ethers.utils.formatBytes32String("0"), 0),
      "msg.sender not solver"
    );
  });

  it("Reverts when non-Solver calls handleCallback", async function () {
    const solverConfigs = [
      {
        implementation: this.Solver.address,
        keeper: this.keeper.address,
        arbitrator: this.arbitrator.address,
        timelockSeconds: this.timelockSeconds,
        data: ethers.utils.formatBytes32String(""),
        ingests: [
          {
            executions: 0,
            ingestType: 1,
            slot: ethers.utils.formatBytes32String("0"),
            solverIndex: 0,
            data: ethers.utils.formatBytes32String("0"),
          },
        ],
        conditionBase: this.conditionBase,
      },
      {
        implementation: this.Solver.address,
        keeper: this.keeper.address,
        arbitrator: this.arbitrator.address,
        timelockSeconds: this.timelockSeconds,
        data: ethers.utils.formatBytes32String(""),
        ingests: [
          {
            executions: 0,
            ingestType: 0,
            slot: ethers.utils.formatBytes32String("0"),
            solverIndex: 0,
            data: ethers.utils.formatBytes32String("0"),
          },
        ],
        conditionBase: this.conditionBase,
      },
    ];

    const solvers = await testHelpers.deploySolverChain(
      solverConfigs,
      this.SolverFactory,
      this.keeper
    );

    return expectRevert(
      solvers[1]
        .connect(this.keeper)
        .handleCallback(ethers.utils.formatBytes32String("0")),
      "msg.sender not solver"
    );
  });

  it("Reverts when routing to slot more times than (conditions.length-1)", async function () {
    const solverConfigs = [
      {
        implementation: this.Solver.address,
        keeper: this.keeper.address,
        arbitrator: this.arbitrator.address,
        timelockSeconds: this.timelockSeconds,
        data: ethers.utils.formatBytes32String(""),
        ingests: [
          {
            executions: 0,
            ingestType: 3,
            slot: ethers.utils.formatBytes32String("0"),
            solverIndex: 0,
            data: ethers.constants.HashZero,
          },
        ],
        conditionBase: this.conditionBase,
      },
      {
        implementation: this.Solver.address,
        keeper: this.keeper.address,
        arbitrator: this.arbitrator.address,
        timelockSeconds: this.timelockSeconds,
        data: ethers.utils.formatBytes32String(""),
        ingests: [
          {
            executions: 0,
            ingestType: 0,
            slot: ethers.utils.formatBytes32String("0"),
            solverIndex: 0,
            data: ethers.utils.defaultAbiCoder.encode(["uint256"], [0]),
          },
        ],
        conditionBase: this.conditionBase,
      },
    ];

    const solvers = await testHelpers.deploySolverChain(
      solverConfigs,
      this.SolverFactory,
      this.keeper
    );

    await solvers[0].connect(this.keeper).prepareSolve(0);
    await solvers[0]
      .connect(this.keeper)
      .addData(
        ethers.utils.formatBytes32String("0"),
        ethers.utils.defaultAbiCoder.encode(["uint256"], [42])
      );

    return expectRevert(
      solvers[0]
        .connect(this.keeper)
        .addData(
          ethers.utils.formatBytes32String("0"),
          ethers.utils.defaultAbiCoder.encode(["uint256"], [42])
        ),
      "Slot version invalid"
    );
  });

  it("Reverts when non-keeper calls addData", async function () {
    const solverConfigs = [
      {
        implementation: this.Solver.address,
        keeper: this.keeper.address,
        arbitrator: this.arbitrator.address,
        timelockSeconds: this.timelockSeconds,
        data: ethers.utils.formatBytes32String(""),
        ingests: [],
        conditionBase: this.conditionBase,
      },
    ];

    const solvers = await testHelpers.deploySolverChain(
      solverConfigs,
      this.SolverFactory,
      this.keeper
    );

    await solvers[0].connect(this.keeper).prepareSolve(0);
    return expectRevert(
      solvers[0]
        .connect(this.user1)
        .addData(
          ethers.utils.formatBytes32String("0"),
          ethers.utils.defaultAbiCoder.encode(["uint256"], [42])
        ),
      "OnlyKeeper"
    );
  });

  it("Receives callback", async function () {
    const solverConfigs = [
      {
        implementation: this.Solver.address,
        keeper: this.keeper.address,
        arbitrator: this.arbitrator.address,
        timelockSeconds: this.timelockSeconds,
        data: ethers.utils.formatBytes32String(""),
        ingests: [
          {
            executions: 0,
            ingestType: 3,
            slot: ethers.utils.formatBytes32String("0"),
            solverIndex: 0,
            data: ethers.constants.HashZero,
          },
        ],
        conditionBase: this.conditionBase,
      },
      {
        implementation: this.Solver.address,
        keeper: this.keeper.address,
        arbitrator: this.arbitrator.address,
        timelockSeconds: this.timelockSeconds,
        data: ethers.utils.formatBytes32String(""),
        ingests: [
          {
            executions: 0,
            ingestType: 0,
            slot: ethers.utils.formatBytes32String("0"),
            solverIndex: 0,
            data: ethers.utils.formatBytes32String("0"),
          },
        ],
        conditionBase: this.conditionBase,
      },
    ];

    const solvers = await testHelpers.deploySolverChain(
      solverConfigs,
      this.SolverFactory,
      this.keeper
    );

    await solvers[0].connect(this.keeper).prepareSolve(0);
    await solvers[0]
      .connect(this.keeper)
      .addData(
        ethers.utils.formatBytes32String("0"),
        ethers.utils.formatBytes32String("Test")
      );

    const data = await solvers[1]
      .connect(this.user1)
      .getData(ethers.utils.formatBytes32String("0"));
    return expect(data).to.equal(ethers.utils.formatBytes32String("Test"));
  });
});
