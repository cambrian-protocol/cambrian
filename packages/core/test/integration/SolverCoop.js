const { ethers, deployments } = require("hardhat");
const { expect } = require("chai");
const SOLVER_ABI =
  require("../../artifacts/contracts/Solver.sol/Solver.json").abi;

const { FormatTypes } = require("ethers/lib/utils");
const {
  getIndexSetFromBinaryArray,
} = require("../../helpers/ConditionalTokens.js");
const testHelpers = require("../../helpers/testHelpers.js");
const { getBytes32FromMultihash } = require("../../helpers/multihash.js");

describe("SolverCoop", function () {
  this.beforeEach(async function () {
    const [buyer, seller, keeper, arbitrator] = await ethers.getSigners();
    this.buyer = buyer;
    this.seller = seller;
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
    this.CT = await ethers.getContract("ConditionalTokens");
    this.SolverFactory = await ethers.getContract("SolverFactory");
    this.ToyToken = await ethers.getContract("ToyToken");
    this.Solver = await ethers.getContract("BasicSolverV1");
    this.ISolver = new ethers.utils.Interface(SOLVER_ABI);
    this.ISolver.format(FormatTypes.full);

    await this.ToyToken.mint(this.buyer.address, "100");
  });

  it("Should execute two-solver Proposal", async function () {
    //Create solution
    const solutionId = ethers.utils.formatBytes32String("TestID");

    /////////INGESTS & ACTIONS & CONFIG ///////////////
    const ingests0 = [
      {
        executions: 0,
        ingestType: 1,
        slot: ethers.utils.formatBytes32String("0"),
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(
          ["address"],
          [this.buyer.address]
        ),
      },
      {
        executions: 0,
        ingestType: 2,
        slot: ethers.utils.formatBytes32String("1"),
        solverIndex: 1,
        data: this.ISolver.encodeFunctionData("addressFromChainIndex", [1]),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: ethers.utils.formatBytes32String("2"),
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], [0]),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: ethers.utils.formatBytes32String("3"),
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], [10000]),
      },
    ];

    const conditionBase0 = {
      collateralToken: this.ToyToken.address,
      outcomeSlots: 2,
      parentCollectionIndexSet: 0,
      amountSlot: ethers.utils.formatBytes32String("3"),
      partition: [1, 2],
      allocations: [
        {
          recipientAddressSlot: ethers.utils.formatBytes32String("0"),
          recipientAmountSlots: [
            ethers.utils.formatBytes32String("2"),
            ethers.utils.formatBytes32String("3"),
          ],
        },
        {
          recipientAddressSlot: ethers.utils.formatBytes32String("1"),
          recipientAmountSlots: [
            ethers.utils.formatBytes32String("3"),
            ethers.utils.formatBytes32String("2"),
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

    // Second Solver
    const ingests1 = [
      {
        executions: 0,
        ingestType: 1,
        slot: ethers.utils.formatBytes32String("0"),
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(
          ["address"],
          [this.buyer.address]
        ),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: ethers.utils.formatBytes32String("1"),
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(
          ["address"],
          [this.seller.address]
        ),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: ethers.utils.formatBytes32String("2"),
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], [0]),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: ethers.utils.formatBytes32String("3"),
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], [10000]),
      },
    ];

    const conditionBase1 = {
      collateralToken: this.ToyToken.address,
      outcomeSlots: 2,
      parentCollectionIndexSet: 1,
      amountSlot: ethers.utils.formatBytes32String("3"),
      partition: [1, 2],
      allocations: [
        {
          recipientAddressSlot: ethers.utils.formatBytes32String("0"),
          recipientAmountSlots: [
            ethers.utils.formatBytes32String("2"),
            ethers.utils.formatBytes32String("3"),
          ],
        },
        {
          recipientAddressSlot: ethers.utils.formatBytes32String("1"),
          recipientAmountSlots: [
            ethers.utils.formatBytes32String("3"),
            ethers.utils.formatBytes32String("2"),
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

    expect(await this.ToyToken.balanceOf(this.seller.address)).to.equal(100);
  });
});
