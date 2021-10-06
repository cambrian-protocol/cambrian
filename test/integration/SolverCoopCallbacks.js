const { ethers, deployments } = require("hardhat");
const { expect } = require("chai");

const SOLVER_ABI =
  require("../../artifacts/contracts/Solver.sol/Solver.json").abi;

const { FormatTypes } = require("ethers/lib/utils");
const {
  getIndexSetFromBinaryArray,
} = require("../../helpers/ConditionalTokens.js");
const testHelpers = require("../../helpers/testHelpers.js");

const {
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");

describe("It should all work", async function () {
  this.beforeEach(async function () {
    const [buyer, seller, keeper, seller2, arbitrator] =
      await ethers.getSigners();

    this.buyer = buyer;
    this.seller = seller;
    this.seller2 = seller2;
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
    this.CT = await ethers.getContract("ConditionalTokens");
    this.SolverFactory = await ethers.getContract("SolverFactory");
    this.ToyToken = await ethers.getContract("ToyToken");
    this.Solver = await ethers.getContract("BasicSolverV1");
    this.ISolver = new ethers.utils.Interface(SOLVER_ABI);
    this.ISolver.format(FormatTypes.full);
    await this.ToyToken.mint(this.buyer.address, "100");
  });

  it("Should execute two-solver Proposal with deferred proposal", async function () {
    //Create solution
    const solutionId = ethers.utils.formatBytes32String("TestID");

    /////////INGESTS & ACTIONS & CONFIG ///////////////
    const ingests0 = [
      {
        executions: 0,
        ingestType: 1,
        slot: 1,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(
          ["address"],
          [this.buyer.address]
        ),
      },
      {
        executions: 0,
        ingestType: 2,

        slot: 2,
        solverIndex: 0,
        data: this.ISolver.encodeFunctionData("addressFromChainIndex", [1]),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: 3,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], [0]),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: 4,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], [100]),
      },
    ];

    const conditionBase0 = {
      collateralToken: this.ToyToken.address,
      outcomeSlots: 2,
      parentCollectionIndexSet: 0,
      amountSlot: 4,
      partition: [1, 2],
      recipientAddressSlots: [1, 2],
      recipientAmountSlots: [
        [3, 4],
        [4, 3],
      ],
      conditionURI: "",
    };

    // Second Solver
    const ingests1 = [
      {
        executions: 0,
        ingestType: 1,
        slot: 1,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(
          ["address"],
          [this.buyer.address]
        ),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: 2,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(
          ["address"],
          [this.seller.address]
        ),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: 3,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], [0]),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: 4,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], [100]),
      },
      {
        // add arbitrary callback data ingest
        executions: 0,
        ingestType: 0,
        dataType: 2,
        slot: 0,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], [0]), // SLOT we are requesting output from for callback
      },
    ];

    const conditionBase1 = {
      collateralToken: this.ToyToken.address,
      outcomeSlots: 2,
      parentCollectionIndexSet: 1,
      amountSlot: 4,
      partition: [1, 2],
      recipientAddressSlots: [1, 2],
      recipientAmountSlots: [
        [3, 4],
        [4, 3],
      ],
      conditionURI: "",
    };

    const solverConfigs = [
      [
        this.Solver.address,
        this.keeper.address,
        this.arbitrator.address,
        0,
        ethers.utils.formatBytes32String(""),
        ingests0,
        conditionBase0,
      ],
      [
        this.Solver.address,
        this.keeper.address,
        this.arbitrator.address,
        0,
        ethers.utils.formatBytes32String(""),
        ingests1,
        conditionBase1,
      ],
    ];
    //////////////////////////////////////////

    // Deploy solverChain
    let solvers = await testHelpers.deploySolverChain(
      solverConfigs,
      this.SolverFactory,
      this.keeper
    );

    //Fund and execute Solver chain
    await this.ToyToken.connect(this.buyer).transfer(solvers[0].address, 100);
    await solvers[0].connect(this.keeper).prepareSolve(0);
    await solvers[0].connect(this.keeper).executeSolve(0);

    const indexSetSuccess = getIndexSetFromBinaryArray([1, 0]); // If success
    const indexSetFailure = getIndexSetFromBinaryArray([0, 1]); // If failure
    const indexSets = [indexSetSuccess, indexSetFailure];

    // Add deferred data to solvers[0] and fetch it from solvers[1]
    await solvers[0].connect(this.keeper).addData(0, ethers.constants.HashZero);

    await solvers[1].connect(this.keeper).executeSolve(0);

    expect(
      await testHelpers.getCTBalances(
        this.CT,
        this.buyer.address,
        solvers[1],
        indexSets
      )
    ).to.eql([0, 100]);

    expect(
      await testHelpers.getCTBalances(
        this.CT,
        this.seller.address,
        solvers[1],
        indexSets
      )
    ).to.eql([100, 0]);

    // Keeper proposes payouts
    await solvers[0].connect(this.keeper).proposePayouts(0, [1, 0]);
    await solvers[1].connect(this.keeper).proposePayouts(0, [1, 0]);
    await solvers[0].connect(this.keeper).confirmPayouts(0);
    await solvers[1].connect(this.keeper).confirmPayouts(0);

    await testHelpers.redeemPositions(
      this.CT,
      this.seller,
      solvers[1],
      indexSets
    );

    expect(
      await testHelpers.getCTBalances(
        this.CT,
        this.seller.address,
        solvers[0],
        indexSets
      )
    ).to.eql([100, 0]);

    await testHelpers.redeemPositions(
      this.CT,
      this.seller,
      solvers[0],
      indexSets
    );

    expect(
      await testHelpers.getCTBalances(
        this.CT,
        this.seller.address,
        solvers[0],
        indexSets
      )
    ).to.eql([0, 0]);

    expect(await this.ToyToken.balanceOf(this.seller.address)).to.equal(100);
  });
});
