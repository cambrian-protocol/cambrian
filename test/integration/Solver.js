const { ethers, deployments } = require("hardhat");
const { expect } = require("chai");
const testHelpers = require("../../helpers/testHelpers.js");
const { getBytes32FromMultihash } = require("../../helpers/multihash.js");

const ctHelpers = require("../../helpers/ConditionalTokens.js");

describe("It should all work", function () {
  this.beforeEach(async function () {
    const [buyer, seller, keeper, arbitrator] = await ethers.getSigners();
    this.buyer = buyer;
    this.seller = seller;
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
    await this.ToyToken.mint(this.buyer.address, "100");
  });

  it("Should execute single-solver Proposal with two outcomes", async function () {
    const ingests0 = [
      {
        executions: 0,
        ingestType: 1,
        slot: 0,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(
          ["bytes32"],
          [ethers.utils.formatBytes32String("")]
        ),
      },
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
    ];

    const canon0 = {
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
        canon0,
      ],
    ];

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

    const conditions = await solvers[0].getConditions();

    // Seller should have all the success tokens
    const indexSetSuccess = ctHelpers.getIndexSetFromBinaryArray([1, 0]); // If success
    const indexSetFailure = ctHelpers.getIndexSetFromBinaryArray([0, 1]); // If failure

    // Keeper proposes payouts
    await solvers[0].connect(this.keeper).proposePayouts(0, [1, 0]);

    const conditionsProposed = await solvers[0].getConditions();
    const payouts = conditionsProposed[conditionsProposed.length - 1].payouts;
    expect(payouts[0]).to.equal(1);
    expect(payouts[1]).to.equal(0);

    // We set timelock to 0, so confirm right away
    await solvers[0].connect(this.keeper).confirmPayouts(0);

    // Seller redeems tokens
    await this.CT.connect(this.seller).redeemPositions(
      this.ToyToken.address,
      ethers.constants.HashZero,
      conditions[conditions.length - 1].conditionId,
      [indexSetSuccess, indexSetFailure]
    );
    const sellerERC20Balance = await this.ToyToken.balanceOf(
      this.seller.address
    );
    expect(sellerERC20Balance).to.equal(100);
  });

  it("Three outcomes, job good", async function () {
    //Create solution
    const solutionId = ethers.utils.formatBytes32String("TestID");

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
        ingestType: 1,
        slot: 1,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(
          ["address"],
          [this.seller.address]
        ),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: 2,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(
          ["address"],
          [this.keeper.address]
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
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], [10]),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: 5,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], [90]),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: 6,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], [100]),
      },
    ];

    const canon0 = {
      collateralToken: this.ToyToken.address,
      outcomeSlots: 3,
      parentCollectionIndexSet: 0,
      amountSlot: 6,
      partition: [4, 2, 1], // Good, Bad, Cancelled
      recipientAddressSlots: [0, 1, 2], // Buyer, Seller, Keeper
      recipientAmountSlots: [
        [3, 5, 4],
        [6, 3, 3],
        [5, 3, 4],
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
        canon0,
      ],
    ];

    let solvers = await testHelpers.deploySolverChain(
      solverConfigs,
      this.SolverFactory,
      this.keeper
    );

    //Fund and execute Solver chain
    await this.ToyToken.connect(this.buyer).transfer(solvers[0].address, 100);
    await solvers[0].connect(this.keeper).prepareSolve(0);
    await solvers[0].connect(this.keeper).executeSolve(0);
    const conditions = await solvers[0].getConditions();

    // Seller should have all the success tokens
    const indexSetSuccess = ctHelpers.getIndexSetFromBinaryArray([0, 0, 1]); // If success
    const indexSetFailure = ctHelpers.getIndexSetFromBinaryArray([0, 1, 0]); // If failure
    const indexSetCancelled = ctHelpers.getIndexSetFromBinaryArray([1, 0, 0]); // If cancelled
    const indexSets = [indexSetSuccess, indexSetFailure, indexSetCancelled];

    expect(
      await testHelpers.getCTBalances(
        this.CT,
        this.buyer.address,
        solvers[0],
        indexSets
      )
    ).to.eql([0, 100, 90]);

    expect(
      await testHelpers.getCTBalances(
        this.CT,
        this.seller.address,
        solvers[0],
        indexSets
      )
    ).to.eql([90, 0, 0]);

    expect(
      await testHelpers.getCTBalances(
        this.CT,
        this.keeper.address,
        solvers[0],
        indexSets
      )
    ).to.eql([10, 0, 10]);

    // Keeper proposes payouts
    await solvers[0].connect(this.keeper).proposePayouts(0, [0, 0, 1]);
    await solvers[0].connect(this.keeper).confirmPayouts(0);

    // Seller redeems tokens
    await this.CT.connect(this.seller).redeemPositions(
      this.ToyToken.address,
      ethers.constants.HashZero,
      conditions[conditions.length - 1].conditionId,
      indexSets
    );
    const sellerERC20Balance = await this.ToyToken.balanceOf(
      this.seller.address
    );
    expect(sellerERC20Balance).to.equal(90);
  });

  it("Correctly allocates less recipients than partitions", async function () {
    //Create solution
    const solutionId = ethers.utils.formatBytes32String("TestID");

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
        ingestType: 1,
        slot: 1,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(
          ["address"],
          [this.seller.address]
        ),
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
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], [10]),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: 4,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], [90]),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: 5,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], [100]),
      },
    ];

    const canon0 = {
      collateralToken: this.ToyToken.address,
      outcomeSlots: 3,
      parentCollectionIndexSet: 0,
      amountSlot: 5,
      partition: [4, 2, 1], // Good, Bad, Cancelled
      recipientAddressSlots: [0, 1], // Buyer, Seller
      recipientAmountSlots: [
        [2, 5],
        [5, 2],
        [4, 3],
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
        canon0,
      ],
    ];

    let solvers = await testHelpers.deploySolverChain(
      solverConfigs,
      this.SolverFactory,
      this.keeper
    );

    //Fund and execute Solver chain
    await this.ToyToken.connect(this.buyer).transfer(solvers[0].address, 100);
    await solvers[0].connect(this.keeper).prepareSolve(0);
    await solvers[0].connect(this.keeper).executeSolve(0);
    const conditions = await solvers[0].getConditions();

    // Seller should have all the success tokens
    const indexSetSuccess = ctHelpers.getIndexSetFromBinaryArray([0, 0, 1]); // If success
    const indexSetFailure = ctHelpers.getIndexSetFromBinaryArray([0, 1, 0]); // If failure
    const indexSetCancelled = ctHelpers.getIndexSetFromBinaryArray([1, 0, 0]); // If cancelled
    const indexSets = [indexSetSuccess, indexSetFailure, indexSetCancelled];

    expect(
      await testHelpers.getCTBalances(
        this.CT,
        this.buyer.address,
        solvers[0],
        indexSets
      )
    ).to.eql([0, 100, 90]);

    expect(
      await testHelpers.getCTBalances(
        this.CT,
        this.seller.address,
        solvers[0],
        indexSets
      )
    ).to.eql([100, 0, 10]);

    // Keeper proposes/confirms payouts
    await solvers[0].connect(this.keeper).proposePayouts(0, [0, 0, 1]);
    await solvers[0].connect(this.keeper).confirmPayouts(0);

    // Seller redeems tokens
    await this.CT.connect(this.seller).redeemPositions(
      this.ToyToken.address,
      ethers.constants.HashZero,
      conditions[conditions.length - 1].conditionId,
      indexSets
    );
    expect(await this.ToyToken.balanceOf(this.seller.address)).to.equal(100);
  });

  it("Correctly allocates more recipients than partitions", async function () {
    //Create solution
    const solutionId = ethers.utils.formatBytes32String("TestID");

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
        ingestType: 1,
        slot: 1,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(
          ["address"],
          [this.seller.address]
        ),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: 2,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(
          ["address"],
          [this.keeper.address]
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
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], [10]),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: 5,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], [90]),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: 6,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], [100]),
      },
    ];

    const canon0 = {
      collateralToken: this.ToyToken.address,
      outcomeSlots: 2,
      parentCollectionIndexSet: 0,
      amountSlot: 6,
      partition: [1, 2], // Good, Bad
      recipientAddressSlots: [0, 1, 2], // Buyer, Seller, Keeper
      recipientAmountSlots: [
        [3, 5, 4],
        [6, 3, 3],
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
        canon0,
      ],
    ];

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

    const conditions = await solvers[0].getConditions();

    // Seller should have all the success tokens
    const indexSetSuccess = ctHelpers.getIndexSetFromBinaryArray([1, 0]); // If success
    const indexSetFailure = ctHelpers.getIndexSetFromBinaryArray([0, 1]); // If failure
    const indexSets = [indexSetSuccess, indexSetFailure];

    expect(
      await testHelpers.getCTBalances(
        this.CT,
        this.buyer.address,
        solvers[0],
        indexSets
      )
    ).to.eql([0, 100]);

    expect(
      await testHelpers.getCTBalances(
        this.CT,
        this.seller.address,
        solvers[0],
        indexSets
      )
    ).to.eql([90, 0]);

    expect(
      await testHelpers.getCTBalances(
        this.CT,
        this.keeper.address,
        solvers[0],
        indexSets
      )
    ).to.eql([10, 0]);

    // Keeper proposes payouts
    await solvers[0].connect(this.keeper).proposePayouts(0, [1, 0]);
    await solvers[0].connect(this.keeper).confirmPayouts(0);

    // Seller redeems tokens
    await this.CT.connect(this.seller).redeemPositions(
      this.ToyToken.address,
      ethers.constants.HashZero,
      conditions[conditions.length - 1].conditionId,
      indexSets
    );
    expect(await this.ToyToken.balanceOf(this.seller.address)).to.equal(90);
  });
});
