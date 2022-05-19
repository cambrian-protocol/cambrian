const { ethers, deployments } = require("hardhat");
const { expect } = require("chai");
const SOLVER_ABI =
  require("../../artifacts/contracts/solvers/Solver.sol/Solver.json").abi;
const { FormatTypes } = require("ethers/lib/utils");

const testHelpers = require("../../helpers/testHelpers.js");
const { getBytes32FromMultihash } = require("../../helpers/multihash.js");

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

  it("Ingests constant data", async function () {
    const ingests = [
      {
        executions: 0,
        ingestType: 1,
        slot: ethers.utils.formatBytes32String("0"),
        solverIndex: 0, // Ignored for ingestType.constant
        data: ethers.utils.formatBytes32String("42"),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: ethers.utils.formatBytes32String("1"),
        solverIndex: 0, // Ignored for ingestType.constant
        data: ethers.utils.formatBytes32String("69"),
      },
    ];

    const solverConfigs = [
      {
        implementation: this.Solver.address,
        keeper: this.keeper.address,
        arbitrator: this.arbitrator.address,
        timelockSeconds: this.timelockSeconds,
        initCalls: [],
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
      ethers.utils.defaultAbiCoder.decode(["address"], rc.events[1].data)[0],
      SOLVER_ABI,
      ethers.provider
    );

    await solver.connect(this.keeper).prepareSolve(0); // calls executeIngests
    expect(
      await solver
        .connect(this.user1)
        .getData(ethers.utils.formatBytes32String("0"))
    ).to.equal(ethers.utils.formatBytes32String("42"));
    expect(
      await solver
        .connect(this.user1)
        .getData(ethers.utils.formatBytes32String("1"))
    ).to.equal(ethers.utils.formatBytes32String("69"));
  });

  it("Ingests local function data", async function () {
    const ingests = [
      {
        executions: 0,
        ingestType: 2,
        slot: ethers.utils.formatBytes32String("0"),
        solverIndex: 0,
        data: this.ISolver.encodeFunctionData("addressFromChainIndex", [0]),
      },
    ];

    const solverConfigs = [
      {
        implementation: this.Solver.address,
        keeper: this.keeper.address,
        arbitrator: this.arbitrator.address,
        timelockSeconds: this.timelockSeconds,
        initCalls: [],
        ingests: ingests,
        conditionBase: this.conditionBase,
      },
      {
        implementation: this.Solver.address,
        keeper: this.keeper.address,
        arbitrator: this.arbitrator.address,
        timelockSeconds: this.timelockSeconds,
        initCalls: [],
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
      ethers.utils.defaultAbiCoder.decode(["address"], rc.events[1].data)[0],
      SOLVER_ABI,
      ethers.provider
    );

    await solver.connect(this.keeper).prepareSolve(0); // calls executeIngests
    expect(
      await solver
        .connect(this.user1)
        .getData(ethers.utils.formatBytes32String("0"))
    ).to.equal(
      ethers.utils.defaultAbiCoder.encode(["address"], [solver.address])
    );
  });

  it("Ingests other chained Solver's function data", async function () {
    const ingests = [
      {
        executions: 0,
        ingestType: 2,
        slot: ethers.utils.formatBytes32String("0"),
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
        initCalls: [],
        ingests: ingests,
        conditionBase: this.conditionBase,
      },
      {
        implementation: this.Solver.address,
        keeper: this.keeper.address,
        arbitrator: this.arbitrator.address,
        timelockSeconds: this.timelockSeconds,
        initCalls: [],
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

    expect(
      await solvers[1]
        .connect(this.user1)
        .getData(ethers.utils.formatBytes32String("0"))
    ).to.equal(
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
        initCalls: [],
        ingests: [],
        conditionBase: this.conditionBase,
      },
      {
        implementation: this.Solver.address,
        keeper: this.keeper.address,
        arbitrator: this.arbitrator.address,
        timelockSeconds: this.timelockSeconds,
        initCalls: [],
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

    await solvers[0].connect(this.keeper).prepareSolve(0); // calls executeIngests
    expect(
      await solvers[0]
        .connect(this.user1)
        .getOutgoingCallbacks(ethers.utils.formatBytes32String("0"))
    ).to.eql([solvers[1].address]);
  });

  it("Ingests callback ingests", async function () {
    const solverConfigs = [
      {
        implementation: this.Solver.address,
        keeper: this.keeper.address,
        arbitrator: this.arbitrator.address,
        timelockSeconds: this.timelockSeconds,
        initCalls: [],
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
        initCalls: [],
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

    await solvers[0].connect(this.keeper).prepareSolve(0); // calls executeIngests
    await solvers[0]
      .connect(this.keeper)
      .addData(
        ethers.utils.formatBytes32String("0"),
        ethers.utils.formatBytes32String("42")
      );

    // expect(await solvers[1].connect(this.user1).ingestsValid()).to.equal(true);
    expect(
      await solvers[1]
        .connect(this.user1)
        .getData(ethers.utils.formatBytes32String("0"))
    ).to.equal(ethers.utils.formatBytes32String("42"));
  });

  it("ingestsValid() == false when callbacks not fulfilled", async function () {
    const solverConfigs = [
      {
        implementation: this.Solver.address,
        keeper: this.keeper.address,
        arbitrator: this.arbitrator.address,
        timelockSeconds: this.timelockSeconds,
        initCalls: [],
        ingests: [],
        conditionBase: this.conditionBase,
      },
      {
        implementation: this.Solver.address,
        keeper: this.keeper.address,
        arbitrator: this.arbitrator.address,
        timelockSeconds: this.timelockSeconds,
        initCalls: [],
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

    await solvers[0].connect(this.keeper).prepareSolve(0); // calls executeIngests

    // SKIP ADDING DATA TO SOLVER0

    expect(await solvers[1].connect(this.user1).ingestsValid()).to.equal(false);
  });
});
