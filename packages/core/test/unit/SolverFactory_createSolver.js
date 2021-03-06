const { ethers, deployments } = require("hardhat");
const { expect } = require("chai");
const SOLVER_ABI =
  require("../../artifacts/contracts/solvers/Solver.sol/Solver.json").abi;
const {
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");
const { getBytes32FromMultihash } = require("../../helpers/multihash.js");

describe("SolverFactory | createSolver", function () {
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
  });

  it("Should deploy from factory", async function () {
    /////////INGESTS & ACTIONS & CONFIG ///////////////
    const createArgs = {
      chainParent: ethers.constants.AddressZero,
      chainIndex: 0,
      solverConfig: this.solverConfigs[0],
    };
    let tx = await this.SolverFactory.createSolver(
      ...Object.values(createArgs)
    );
    let rc = await tx.wait();
    expect(rc.events[1].event).to.equal("SolverCreated");
  });

  it("Has correct config after initialization", async function () {
    /////////INGESTS & ACTIONS & CONFIG ///////////////
    const createArgs = {
      chainParent: ethers.constants.AddressZero,
      chainIndex: 0,
      solverConfig: this.solverConfigs[0],
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

    const initConfig = await solver.config();
    expect(initConfig.timelockSeconds).to.equal(this.timelockSeconds);
    expect(initConfig.keeper).to.equal(this.keeper.address);
    expect(initConfig.arbitrator).to.equal(this.arbitrator.address);
    expect(await solver.chainParent()).to.equal(ethers.constants.AddressZero);
    expect(await solver.chainChild()).to.equal(ethers.constants.AddressZero);
    expect(await solver.chainIndex()).to.equal(0);
  });

  it("Requires valid chainParent/Index combination", async function () {
    let createArgs = {
      chainParent: ethers.constants.AddressZero,
      chainIndex: 1,
      solverConfig: this.solverConfigs[0],
    };

    expectRevert(
      this.SolverFactory.createSolver(...Object.values(createArgs)),
      "Invalid chain parent/index"
    );

    createArgs = {
      chainParent: this.keeper.address,
      chainIndex: 0,
      solverConfig: this.solverConfigs[0],
    };

    expectRevert(
      this.SolverFactory.createSolver(...Object.values(createArgs)),
      "Invalid chain parent/index"
    );
  });
});
