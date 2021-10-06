const { ethers, deployments } = require("hardhat");
const { expect } = require("chai");
const SOLVER_ABI =
  require("../../artifacts/contracts/Solver.sol/Solver.json").abi;
const {
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");
const testHelpers = require("../../helpers/testHelpers.js");
const ctHelpers = require("../../helpers/ConditionalTokens.js");

describe("Solver | deployChild", function () {
  this.beforeEach(async function () {
    const [keeper, arbitrator] = await ethers.getSigners();
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

    this.timelockSeconds = 1;

    this.ingests = [];
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

    this.solverConfigs = [
      {
        implementation: this.Solver.address,
        keeper: this.keeper.address,
        arbitrator: this.arbitrator.address,
        timelockSeconds: this.timelockSeconds,
        data: ethers.utils.formatBytes32String(""),
        ingests: this.ingests,
        conditionBase: this.conditionBase,
      },
    ];
  });

  it("Deploys child from parent", async function () {
    /////////INGESTS & ACTIONS & CONFIG ///////////////
    let createArgs = {
      chainParent: ethers.constants.AddressZero,
      chainIndex: 0,
      solverConfig: this.solverConfigs[0],
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

    tx = await solver.connect(this.keeper).deployChild(this.solverConfigs[0]);
    rc = await tx.wait();
    expect(rc.events[1].event).to.equal("DeployedChild");
  });

  it("Can't deploy a second child", async function () {
    /////////INGESTS & ACTIONS & CONFIG ///////////////
    let createArgs = {
      chainParent: ethers.constants.AddressZero,
      chainIndex: 0,
      solverConfig: this.solverConfigs[0],
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

    await solver.connect(this.keeper).deployChild(this.solverConfigs[0]);
    expectRevert(
      solver.connect(this.keeper).deployChild(this.solverConfigs[0]),
      "Solver has child"
    );
  });

  it("Only keeper can deploy a child", async function () {
    /////////INGESTS & ACTIONS & CONFIG ///////////////
    let createArgs = {
      chainParent: ethers.constants.AddressZero,
      chainIndex: 0,
      solverConfig: this.solverConfigs[0],
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

    expectRevert(
      solver.connect(this.arbitrator).deployChild(this.solverConfigs[0]),
      "Only keeper"
    );
  });
});
