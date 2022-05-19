const { ethers, deployments } = require("hardhat");
const { expect } = require("chai");
const SOLVER_ABI =
  require("../../artifacts/contracts/solvers/Solver.sol/Solver.json").abi;
const {
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");
const { getBytes32FromMultihash } = require("../../helpers/multihash.js");

describe("Solver | deployChild", function () {
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
        getBytes32FromMultihash(
          "QmYZB6LDtGqqfJyhJDEp7rgFgEVSm7H7yyXZjhvCqVkYvZ"
        ),
        getBytes32FromMultihash(
          "QmPrcQH4akfr7eSn4tQHmmudLdJpKhHskVJ5iqYxCks1FP"
        ),
      ],
    };

    this.solverConfigs = [
      {
        implementation: this.Solver.address,
        keeper: this.keeper.address,
        arbitrator: this.arbitrator.address,
        timelockSeconds: this.timelockSeconds,
        initCalls: [],
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
      ethers.utils.defaultAbiCoder.decode(["address"], rc.events[1].data)[0],
      SOLVER_ABI,
      ethers.provider
    );

    tx = await solver.connect(this.keeper).deployChild(this.solverConfigs[0]);
    rc = await tx.wait();
    expect(rc.events.find((e) => e.event === "DeployedChild")).to.exist;
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
      ethers.utils.defaultAbiCoder.decode(["address"], rc.events[1].data)[0],
      SOLVER_ABI,
      ethers.provider
    );

    await solver.connect(this.keeper).deployChild(this.solverConfigs[0]);
    return expectRevert(
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
      ethers.utils.defaultAbiCoder.decode(["address"], rc.events[1].data)[0],
      SOLVER_ABI,
      ethers.provider
    );

    return expectRevert(
      solver.connect(this.arbitrator).deployChild(this.solverConfigs[0]),
      "Only keeper"
    );
  });
});
