const { ethers, deployments } = require("hardhat");
const { expect } = require("chai");
const SOLVER_ABI =
  require("../../artifacts/contracts/solvers/Solver.sol/Solver.json").abi;
const {
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");
const testHelpers = require("../../helpers/testHelpers.js");
const { getBytes32FromMultihash } = require("../../helpers/multihash.js");

describe("Solver.sol | prepareSolve", function () {
  this.beforeEach(async function () {
    const [keeper, arbitrator] = await ethers.getSigners();
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

    this.timelockSeconds = 1;

    this.ingests = [];
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
        "QmYZB6LDtGqqfJyhJDEp7rgFgEVSm7H7yyXZjhvCqVkYvZ",
        "QmPrcQH4akfr7eSn4tQHmmudLdJpKhHskVJ5iqYxCks1FP",
      ],
    };

    this.solverConfigs = [
      {
        implementation: this.Solver.address,
        keeper: this.keeper.address,
        arbitrator: this.arbitrator.address,
        timelockSeconds: this.timelockSeconds,
        moduleLoaders: [],
        ingests: this.ingests,
        conditionBase: this.conditionBase,
      },
    ];

    let createArgs = {
      chainParent: ethers.constants.AddressZero,
      chainIndex: 0,
      solverConfig: this.solverConfigs[0],
    };
    let tx = await this.SolverFactory.createSolver(
      ...Object.values(createArgs)
    );
    let rc = await tx.wait();

    this.solver = new ethers.Contract(
      ethers.utils.defaultAbiCoder.decode(["address"], rc.events[1].data)[0],
      SOLVER_ABI,
      ethers.provider
    );
  });

  it("Prepares one solve and emits event", async function () {
    let tx = await this.solver.connect(this.keeper).prepareSolve(0);
    let rc = await tx.wait();
    expect(rc.events[2].event).to.equal("PreparedSolve");
    expect(
      ethers.utils.defaultAbiCoder.decode(
        ["address", "uint256"],
        rc.events[2].data
      )
    ).to.eql([this.solver.address, ethers.BigNumber.from(0)]);
  });

  it("Prepares a child's solve after its own", async function () {
    let tx = await this.solver
      .connect(this.keeper)
      .deployChild(this.solverConfigs[0]);
    let rc = await tx.wait();
    let childAddress = ethers.utils.defaultAbiCoder.decode(
      ["address"],
      rc.events[1].data
    )[0];

    tx = await this.solver.connect(this.keeper).prepareSolve(0);
    rc = await tx.wait();
    expect(rc.events[5].event).to.equal("PreparedSolve");
    expect(
      ethers.utils.defaultAbiCoder.decode(
        ["address", "uint256"],
        rc.events[5].data
      )
    ).to.eql([childAddress, ethers.BigNumber.from(0)]);
  });

  it("Can prepare multiple solves", async function () {
    await this.solver.connect(this.keeper).prepareSolve(0);
    let tx = await this.solver.connect(this.keeper).prepareSolve(1);
    let rc = await tx.wait();

    expect(rc.events[2].event).to.equal("PreparedSolve");
    expect(
      ethers.utils.defaultAbiCoder.decode(
        ["address", "uint256"],
        rc.events[2].data
      )
    ).to.eql([this.solver.address, ethers.BigNumber.from(1)]);
  });

  it("Can't prepare same solve index twice", async function () {
    await this.solver.connect(this.keeper).prepareSolve(0);
    expectRevert(
      this.solver.connect(this.keeper).prepareSolve(0),
      "Invalid index"
    );
  });

  it("Can't prepare solve with index > conditions.length", async function () {
    expectRevert(
      this.solver.connect(this.keeper).prepareSolve(1),
      "Invalid index"
    );
    await this.solver.connect(this.keeper).prepareSolve(0);
    expectRevert(
      this.solver.connect(this.keeper).prepareSolve(2),
      "Invalid index"
    );
  });

  it("Can't prepare solve before fulfilling outgoing callbacks", async function () {
    const solverConfigs = [
      {
        implementation: this.Solver.address,
        keeper: this.keeper.address,
        arbitrator: this.arbitrator.address,
        timelockSeconds: this.timelockSeconds,
        moduleLoaders: [],
        ingests: [],
        conditionBase: this.conditionBase,
      },
      {
        implementation: this.Solver.address,
        keeper: this.keeper.address,
        arbitrator: this.arbitrator.address,
        timelockSeconds: this.timelockSeconds,
        moduleLoaders: [],
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
    return expectRevert(
      solvers[0].connect(this.keeper).prepareSolve(1),
      "outgoing cbs"
    );
  });

  it("Can't prepare solve before fulfilling incoming callbacks", async function () {
    const solverConfigs = [
      {
        implementation: this.Solver.address,
        keeper: this.keeper.address,
        arbitrator: this.arbitrator.address,
        timelockSeconds: this.timelockSeconds,
        moduleLoaders: [],
        ingests: [],
        conditionBase: this.conditionBase,
      },
      {
        implementation: this.Solver.address,
        keeper: this.keeper.address,
        arbitrator: this.arbitrator.address,
        timelockSeconds: this.timelockSeconds,
        moduleLoaders: [],
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
    return expectRevert(
      solvers[1].connect(this.keeper).prepareSolve(1),
      "incoming cbs"
    );
  });

  it("Parent needs at least one condition prepared", async function () {
    const solverConfigs = [
      {
        implementation: this.Solver.address,
        keeper: this.keeper.address,
        arbitrator: this.arbitrator.address,
        timelockSeconds: this.timelockSeconds,
        moduleLoaders: [],
        ingests: [],
        conditionBase: this.conditionBase,
      },
      {
        implementation: this.Solver.address,
        keeper: this.keeper.address,
        arbitrator: this.arbitrator.address,
        timelockSeconds: this.timelockSeconds,
        moduleLoaders: [],
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
      solvers[1].connect(this.keeper).prepareSolve(0),
      "Parent has no conditions"
    );
  });

  it("Allows downchain solvers to prepare from finalized upstream data", async function () {
    const solverConfigs = [
      {
        implementation: this.Solver.address,
        keeper: this.keeper.address,
        arbitrator: this.arbitrator.address,
        timelockSeconds: this.timelockSeconds,
        moduleLoaders: [],
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
        moduleLoaders: [],
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
        ethers.utils.formatBytes32String("42")
      );

    await solvers[1].connect(this.keeper).prepareSolve(1);
    expect(await solvers[1].ingestsValid()).to.equal(true);

    await solvers[1].connect(this.keeper).prepareSolve(2);
    return expect(await solvers[1].ingestsValid()).to.equal(true);

    // return expectRevert(
    //   solvers[0].connect(this.keeper).prepareSolve(0),
    //   "Fulfill outgoing callbacks first"
    // );
  });
});
