const { ethers, deployments } = require("hardhat");
const { expect } = require("chai");
const SOLVER_ABI =
  require("../../artifacts/contracts/Solver.sol/Solver.json").abi;
const {
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");
const { FormatTypes } = require("ethers/lib/utils");

const testHelpers = require("../../helpers/testHelpers.js");
const ctHelpers = require("../../helpers/ConditionalTokens.js");

describe("Solver.sol | executeIngests", function () {
  this.beforeEach(async function () {
    const [user1, user2, keeper, arbitrator] = await ethers.getSigners();
    this.user1 = user1;
    this.user2 = user2;
    this.keeper = keeper;
    this.arbitrator = arbitrator;

    await deployments.fixture([
      "ConditionalTokens",
      "SolverFactory",
      "SolutionsHub",
      "ProposalsHub",
      "ToyToken",
      "BasicSolverV1",
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
      amountSlot: 0,
      partition: [0, 0],
      recipientAddressSlots: [0],
      recipientAmountSlots: [[0, 0]],
      conditionURI: "",
    };
  });

  it("Ingests constant data", async function () {
    const ingests = [
      {
        executions: 0,
        ingestType: 1,
        slot: 0,
        solverIndex: 0, // Ignored for ingestType.constant
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], [42]),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: 1,
        solverIndex: 0, // Ignored for ingestType.constant
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], [69]),
      },
    ];

    const solverConfigs = [
      {
        implementation: this.Solver.address,
        keeper: this.keeper.address,
        arbitrator: this.arbitrator.address,
        timelockSeconds: this.timelockSeconds,
        data: ethers.utils.formatBytes32String(""),
        ingests: ingests,
        conditionBase: this.conditionBase,
      },
    ];

    let createArgs = {
      chainParent: ethers.constants.AddressZero,
      chainIndex: 0,
      solverConfig: solverConfigs[0],
    };
    let tx = await this.SolverFactory.createSolver(
      ...Object.values(createArgs)
    );
    let rc = await tx.wait();

    const solver = new ethers.Contract(
      ethers.utils.defaultAbiCoder.decode(["address"], rc.events[0].data)[0],
      SOLVER_ABI,
      ethers.provider
    );

    await solver.connect(this.keeper).prepareSolve(0); // calls executeIngests
    expect(await solver.connect(this.user1).getData(0)).to.equal(
      ethers.utils.defaultAbiCoder.encode(["uint256"], [42])
    );
    expect(await solver.connect(this.user1).getData(1)).to.equal(
      ethers.utils.defaultAbiCoder.encode(["uint256"], [69])
    );
  });

  it("Ingests local function data", async function () {
    const ingests = [
      {
        executions: 0,
        ingestType: 2,
        slot: 0,
        solverIndex: 0,
        data: this.ISolver.encodeFunctionData("percentage", [42, 420, 1]),
      },
    ];

    const solverConfigs = [
      {
        implementation: this.Solver.address,
        keeper: this.keeper.address,
        arbitrator: this.arbitrator.address,
        timelockSeconds: this.timelockSeconds,
        data: ethers.utils.formatBytes32String(""),
        ingests: ingests,
        conditionBase: this.conditionBase,
      },
      {
        implementation: this.Solver.address,
        keeper: this.keeper.address,
        arbitrator: this.arbitrator.address,
        timelockSeconds: this.timelockSeconds,
        data: ethers.utils.formatBytes32String(""),
        ingests: ingests,
        conditionBase: this.conditionBase,
      },
    ];

    let createArgs = {
      chainParent: ethers.constants.AddressZero,
      chainIndex: 0,
      solverConfig: solverConfigs[0],
    };
    let tx = await this.SolverFactory.createSolver(
      ...Object.values(createArgs)
    );
    let rc = await tx.wait();

    const solver = new ethers.Contract(
      ethers.utils.defaultAbiCoder.decode(["address"], rc.events[0].data)[0],
      SOLVER_ABI,
      ethers.provider
    );

    await solver.connect(this.keeper).prepareSolve(0); // calls executeIngests
    expect(await solver.connect(this.user1).getData(0)).to.equal(
      ethers.utils.defaultAbiCoder.encode(["uint256"], [10]) // 42 is 10% of 420
    );
  });

  it("Ingests other chained Solver's function data", async function () {
    const ingests = [
      {
        executions: 0,
        ingestType: 2,
        slot: 0,
        solverIndex: 1,
        data: this.ISolver.encodeFunctionData("addressFromChainIndex", [0]),
      },
    ];

    const solverConfigs = [
      {
        implementation: this.Solver.address,
        keeper: this.keeper.address,
        arbitrator: this.arbitrator.address,
        timelockSeconds: this.timelockSeconds,
        data: ethers.utils.formatBytes32String(""),
        ingests: ingests,
        conditionBase: this.conditionBase,
      },
      {
        implementation: this.Solver.address,
        keeper: this.keeper.address,
        arbitrator: this.arbitrator.address,
        timelockSeconds: this.timelockSeconds,
        data: ethers.utils.formatBytes32String(""),
        ingests: ingests,
        conditionBase: this.conditionBase,
      },
    ];

    const solvers = await testHelpers.deploySolverChain(
      solverConfigs,
      this.SolverFactory,
      this.keeper
    );

    await solvers[0].connect(this.keeper).prepareSolve(0); // calls executeIngests

    expect(await solvers[1].connect(this.user1).getData(0)).to.equal(
      ethers.utils.defaultAbiCoder.encode(["address"], [solvers[0].address])
    );
  });

  it("Creates callbacks for callback ingests", async function () {
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
            slot: 0,
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

    await solvers[0].connect(this.keeper).prepareSolve(0); // calls executeIngests
    expect(await solvers[0].connect(this.user1).getOutgoingCallbacks(0)).to.eql(
      [solvers[1].address]
    );
  });

  it("Ingests callback ingests", async function () {
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
            slot: 0,
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

    await solvers[0].connect(this.keeper).prepareSolve(0); // calls executeIngests
    await solvers[0]
      .connect(this.keeper)
      .addData(0, ethers.utils.defaultAbiCoder.encode(["uint256"], [42]));

    expect(await solvers[1].connect(this.user1).ingestsValid()).to.equal(true);
    expect(await solvers[1].connect(this.user1).getData(0)).to.equal(
      ethers.utils.defaultAbiCoder.encode(["uint256"], [42])
    );
  });

  it("ingestsValid() == false when callbacks not fulfilled", async function () {
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
            slot: 0,
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

    await solvers[0].connect(this.keeper).prepareSolve(0); // calls executeIngests

    // SKIP ADDING DATA TO SOLVER0

    expect(await solvers[1].connect(this.user1).ingestsValid()).to.equal(false);
  });
});
