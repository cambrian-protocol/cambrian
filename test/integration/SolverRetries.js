const { ethers, deployments } = require("hardhat");
const { expect } = require("chai");
const CT_ABI =
  require("../../artifacts/contracts/ConditionalTokens.sol/ConditionalTokens.json").abi;
const SOLVER_ABI =
  require("../../artifacts/contracts/Solver.sol/Solver.json").abi;
const { FormatTypes } = require("ethers/lib/utils");
const {
  getIndexSetFromBinaryArray,
} = require("../../helpers/ConditionalTokens.js");
const testHelpers = require("../../helpers/testHelpers.js");
const { getBytes32FromMultihash } = require("../../helpers/multihash.js");

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

  it("Should allow a retry from Solver0 in a 2-solver proposal", async function () {
    /////////INGESTS & ACTIONS & CONFIG ///////////////
    const ingests0 = [
      {
        executions: 0,
        ingestType: 1,
        slot: 0,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(
          ["address"],
          [this.buyer.address]
        ),
      },
      {
        executions: 0,
        ingestType: 2,
        slot: 1,
        solverIndex: 0,
        data: this.ISolver.encodeFunctionData("addressFromChainIndex", [1]),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: 2,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], [0]),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: 3,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], [100]),
      },
    ];

    const conditionBase0 = {
      collateralToken: this.ToyToken.address,
      outcomeSlots: 2,
      parentCollectionIndexSet: 0,
      amountSlot: 3,
      partition: [1, 2],
      recipientAddressSlots: [0, 1],
      recipientAmountSlots: [
        [2, 3],
        [3, 2],
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
        ingestType: 2,
        slot: 0,
        solverIndex: 1,
        data: this.ISolver.encodeFunctionData("addressFromChainIndex", [0]),
      },
      {
        executions: 0,
        ingestType: 0,
        slot: 1,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], [4]), // deferredIngests take the key of slot in solver passing it down
      },
      {
        executions: 0,
        ingestType: 1,
        slot: 2,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], [0]),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: 3,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], [100]),
      },
    ];

    const conditionBase1 = {
      collateralToken: this.ToyToken.address,
      outcomeSlots: 2,
      parentCollectionIndexSet: 1,
      amountSlot: 3,
      partition: [1, 2],
      recipientAddressSlots: [0, 1],
      recipientAmountSlots: [
        [2, 3],
        [3, 2],
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

    // // Add deferred data to solvers[0] and fetch it from solvers[1]
    await solvers[0]
      .connect(this.keeper)
      .addData(
        4,
        ethers.utils.defaultAbiCoder.encode(["address"], [this.seller.address])
      );

    const indexSetSuccess = getIndexSetFromBinaryArray([1, 0]); // If success
    const indexSetFailure = getIndexSetFromBinaryArray([0, 1]); // If failure
    const indexSets = [indexSetSuccess, indexSetFailure];

    let splitPositionEvents = [];
    let iface = new ethers.utils.Interface(CT_ABI);
    let tx = await solvers[0].connect(this.keeper).executeSolve(0);
    let rc = await tx.wait();
    let events = rc.logs.map((log) => {
      try {
        return iface.parseLog(log);
      } catch (err) {}
    });
    events.forEach((event) => {
      if (event && event.name == "PositionSplit") {
        splitPositionEvents.push(event);
      }
    });

    await solvers[0].connect(this.keeper).proposePayouts(0, [1, 0]); // success, found someone
    await solvers[1].connect(this.keeper).proposePayouts(0, [0, 1]); // failure, work bad
    await solvers[0].connect(this.keeper).confirmPayouts(0);
    await solvers[1].connect(this.keeper).confirmPayouts(0);

    // Redeem "failure" CTs  sent back from downstream solver up to ERC20 and prepare new Solve
    await solvers[0]
      .connect(this.keeper)
      .redeemPosition(
        splitPositionEvents[1].args.collateralToken,
        splitPositionEvents[1].args.parentCollectionId,
        splitPositionEvents[1].args.conditionId,
        splitPositionEvents[1].args.partition
      );
    await solvers[0]
      .connect(this.keeper)
      .redeemPosition(
        splitPositionEvents[0].args.collateralToken,
        splitPositionEvents[0].args.parentCollectionId,
        splitPositionEvents[0].args.conditionId,
        splitPositionEvents[0].args.partition
      );

    await solvers[0].connect(this.keeper).prepareSolve(1);
    await solvers[0]
      .connect(this.keeper)
      .addData(
        4,
        ethers.utils.defaultAbiCoder.encode(["address"], [this.seller2.address])
      );
    await solvers[0].connect(this.keeper).executeSolve(1);

    await solvers[0].connect(this.keeper).proposePayouts(1, [1, 0]); // success, found someone
    await solvers[0].connect(this.keeper).confirmPayouts(1);
    await solvers[1].connect(this.keeper).proposePayouts(1, [1, 0]); // success, work good
    await solvers[1].connect(this.keeper).confirmPayouts(1);

    await testHelpers.getCTBalances(this.CT, this.seller2.address, solvers[0], [
      indexSetSuccess,
      indexSetFailure,
    ]);
    await testHelpers.getCTBalances(this.CT, this.seller2.address, solvers[1], [
      indexSetSuccess,
      indexSetFailure,
    ]);

    await testHelpers.redeemPositions(this.CT, this.seller2, solvers[1], [
      indexSetSuccess,
      indexSetFailure,
    ]);
    await testHelpers.getCTBalances(this.CT, this.seller2.address, solvers[1], [
      indexSetSuccess,
      indexSetFailure,
    ]);

    await testHelpers.redeemPositions(this.CT, this.seller2, solvers[0], [
      indexSetSuccess,
      indexSetFailure,
    ]);

    // Seller redeems tokens
    const sellerERC20Balance = await this.ToyToken.balanceOf(
      this.seller2.address
    );
    expect(sellerERC20Balance).to.equal(100);
  });
});
