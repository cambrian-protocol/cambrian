const { ethers, deployments } = require("hardhat");
const { expect } = require("chai");
const SOLVER_ABI = require("../artifacts/contracts/Solver.sol/Solver.json").abi;
const SOLUTIONSHUB_ABI = require("../artifacts/contracts/SolutionsHub.sol/SolutionsHub.json").abi;
const { FormatTypes } = require("ethers/lib/utils");
const { getIndexSetFromBinaryArray } = require("../helpers/ConditionalTokens.js")


describe("It should all work", function () {
  this.beforeEach(async function () {
    
    const [buyer, seller, keeper, arbitrator] = await ethers.getSigners();
    this.buyer = buyer;
    this.seller = seller;
    this.keeper = keeper;
    this.arbitrator = arbitrator;

    await deployments.fixture(["ConditionalTokens", "SolverFactory", "SolutionsHub", "ProposalsHub", "ToyToken", "BasicSolverV1"]);
    this.CT = await ethers.getContract("ConditionalTokens")
    this.SolverFactory = await ethers.getContract("SolverFactory")
    this.SolutionsHub = await ethers.getContract("SolutionsHub")
    this.ProposalsHub = await ethers.getContract("ProposalsHub")
    this.ToyToken = await ethers.getContract("ToyToken")
    this.Solver = await ethers.getContract("BasicSolverV1")

    await this.ToyToken.mint(this.buyer.address, "100");


    this.ISolver = new ethers.utils.Interface(SOLVER_ABI);
    this.ISolver.format(FormatTypes.full);

    this.ISolutionsHub = new ethers.utils.Interface(SOLUTIONSHUB_ABI);
    this.ISolutionsHub.format(FormatTypes.full);
  });

  it("Should execute single-solver Proposal with two outcomes", async function () {
    //Create solution
    const solutionId = ethers.utils.formatBytes32String("TestID")
  
    /////////INGESTS & ACTIONS & CONFIG ///////////////
    const ingests0 = [
      {
        executions: 0,
        isDeferred: false,
        isConstant: true,
        dataType: 0,
        key: 1,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['address'], [this.buyer.address])
      },
      {
        executions: 0,
        isDeferred: false,
        isConstant: true,
        dataType: 0,
        key: 2,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['address'], [this.seller.address])
      },
      {
        executions: 0,
        isConstant: true,
        dataType: 3,
        key: 0,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['bytes32'], [ethers.utils.formatBytes32String("")])
      },
      {
        executions: 0,
        isConstant: true,
        dataType: 4,
        key: 3,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['uint256'], [0])
      },
      {
        executions: 0,
        isConstant: true,
        dataType: 4,
        key: 4,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['uint256'], [100])
      }
    ]

    const canon0 = {
      collateralToken: this.ToyToken.address,
      outcomeSlots: 2,
      parentCollectionIndexSet: 0,
      amount: 100,
      partition: [1,2],
      recipientAddressSlots: [1,2],
      recipientAmountSlots: [[3,4],[4,3]],
      conditionURI: ""
    }

    const solverConfigs = [
      [
        this.Solver.address,
        this.keeper.address,
        this.arbitrator.address,
        0,
        ethers.utils.formatBytes32String(""),
        ingests0,
        canon0
      ]
    ];


    await this.SolutionsHub.connect(this.keeper).createSolution(
      solutionId,
      this.ToyToken.address,
      solverConfigs
    );
 

    //Create proposal
    let tx2 = await this.ProposalsHub.connect(this.keeper).createProposal(
      this.ToyToken.address,
      this.SolutionsHub.address,
      100,
      solutionId
    );
    let receipt2 = await tx2.wait();
    let iface2 = new ethers.utils.Interface([
      "event CreateProposal(bytes32 id)",
    ]);
    const proposalId = iface2.parseLog(receipt2.logs[0]).args.id;
    const proposal = await this.ProposalsHub.getProposal(proposalId);

    //Fund and execute Proposal
    await this.ToyToken.connect(this.buyer).approve(
      this.ProposalsHub.address,
      100
    );
    await this.ProposalsHub.connect(this.buyer).fundProposal(
      proposalId,
      this.ToyToken.address,
      100
    );

    await this.ProposalsHub.executeProposal(proposalId);

    const solverAddress = await this.SolutionsHub.solverFromIndex(solutionId, 0);
    const solverERC20Balance = await this.ToyToken.balanceOf(solverAddress);
    const CTERC20Balance = await this.ToyToken.balanceOf(this.CT.address);
    // Collateral has been sent to CT contract
    expect(solverERC20Balance).to.equal(0);
    expect(CTERC20Balance).to.equal(100);


    // Connect to our Prime Solver
    let solver = new ethers.Contract(solverAddress, SOLVER_ABI, ethers.provider);

    const conditions = await solver.getConditions();
    const conditionId = conditions[conditions.length-1].conditionId

    // Seller should have all the success tokens
    const indexSetSuccess = getIndexSetFromBinaryArray([1,0]) // If success
    const indexSetFailure = getIndexSetFromBinaryArray([0,1]) // If failure

    console.log("index set success: ", indexSetSuccess)
    console.log("index set failure: ", indexSetFailure)

    const collectionIdSuccess = await this.CT.getCollectionId(ethers.constants.HashZero, conditionId, indexSetSuccess)
    const positionIdSuccess = await this.CT.getPositionId(this.ToyToken.address, collectionIdSuccess)
    const buyerSuccessBalance = await this.CT.balanceOf(this.buyer.address, positionIdSuccess)
    const sellerSuccessBalance = await this.CT.balanceOf(this.seller.address, positionIdSuccess)
    expect(buyerSuccessBalance).to.equal(0)
    expect(sellerSuccessBalance).to.equal(100)


    // Buyer should have all the failure tokens
    const collectionIdFailure = await this.CT.getCollectionId(ethers.constants.HashZero, conditionId, indexSetFailure)
    const positionIdFailure = await this.CT.getPositionId(this.ToyToken.address, collectionIdFailure)
    const buyerFailureBalance = await this.CT.balanceOf(this.buyer.address, positionIdFailure)
    const sellerFailureBalance = await this.CT.balanceOf(this.seller.address, positionIdFailure)
    expect(buyerFailureBalance).to.equal(100)
    expect(sellerFailureBalance).to.equal(0)


    // Keeper proposes payouts
    await solver.connect(this.keeper).proposePayouts(0, [1,0]);

    const conditionsProposed = await solver.getConditions();
    const payouts = conditionsProposed[conditionsProposed.length-1].payouts;
    expect(payouts[0]).to.equal(1)
    expect(payouts[1]).to.equal(0)

    // We set timelock to 0, so confirm right away
    await solver.connect(this.keeper).confirmPayouts(0);

    // Seller redeems tokens
    await this.CT.connect(this.seller).redeemPositions(this.ToyToken.address, ethers.constants.HashZero, conditionId, [indexSetSuccess, indexSetFailure])
    const sellerERC20Balance = await this.ToyToken.balanceOf(this.seller.address);
    expect(sellerERC20Balance).to.equal(100);
  });

  it("Three outcomes, job good", async function () {
    //Create solution
    const solutionId = ethers.utils.formatBytes32String("TestID")
  
    /////////INGESTS & ACTIONS & CONFIG ///////////////
    const ingests0 = [
      {
        executions: 0,
        isDeferred: false,
        isConstant: true,
        dataType: 0,
        key: 1,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['address'], [this.buyer.address])
      },
      {
        executions: 0,
        isDeferred: false,
        isConstant: true,
        dataType: 0,
        key: 2,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['address'], [this.seller.address])
      },
      {
        executions: 0,
        isDeferred: false,
        isConstant: true,
        dataType: 0,
        key: 3,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['address'], [this.keeper.address])
      },
      {
        executions: 0,
        isConstant: true,
        dataType: 4,
        key: 4,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['uint256'], [0])
      },
      {
        executions: 0,
        isConstant: true,
        dataType: 4,
        key: 5,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['uint256'], [10])
      },
      {
        executions: 0,
        isConstant: true,
        dataType: 4,
        key: 6,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['uint256'], [90])
      },
      {
        executions: 0,
        isConstant: true,
        dataType: 4,
        key: 7,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['uint256'], [100])
      }
    ]

    const canon0 = {
      collateralToken: this.ToyToken.address,
      outcomeSlots: 3,
      parentCollectionIndexSet: 0,
      amount: 100,
      partition: [4,2,1], // Good, Bad, Cancelled
      recipientAddressSlots: [1,2,3], // Buyer, Seller, Keeper
      recipientAmountSlots: [[4,6,5],[7,4,4],[6,4,5]],
      conditionURI: ""
    }

    const solverConfigs = [
      [
        this.Solver.address,
        this.keeper.address,
        this.arbitrator.address,
        0,
        ethers.utils.formatBytes32String(""),
        ingests0,
        canon0
      ]
    ];

    await this.SolutionsHub.connect(this.keeper).createSolution(
      solutionId,
      this.ToyToken.address,
      solverConfigs
    );
 

    //Create proposal
    let tx2 = await this.ProposalsHub.connect(this.keeper).createProposal(
      this.ToyToken.address,
      this.SolutionsHub.address,
      100,
      solutionId
    );
    let receipt2 = await tx2.wait();
    let iface2 = new ethers.utils.Interface([
      "event CreateProposal(bytes32 id)",
    ]);
    const proposalId = iface2.parseLog(receipt2.logs[0]).args.id;
    const proposal = await this.ProposalsHub.getProposal(proposalId);

    //Fund and execute Proposal
    await this.ToyToken.connect(this.buyer).approve(
      this.ProposalsHub.address,
      100
    );
    await this.ProposalsHub.connect(this.buyer).fundProposal(
      proposalId,
      this.ToyToken.address,
      100
    );

    await this.ProposalsHub.executeProposal(proposalId);

    const solverAddress = await this.SolutionsHub.solverFromIndex(solutionId, 0);
    const solverERC20Balance = await this.ToyToken.balanceOf(solverAddress);
    const CTERC20Balance = await this.ToyToken.balanceOf(this.CT.address);
    // Collateral has been sent to CT contract
    expect(solverERC20Balance).to.equal(0);
    expect(CTERC20Balance).to.equal(100);


    // Connect to our Prime Solver
    let solver = new ethers.Contract(solverAddress, SOLVER_ABI, ethers.provider);

    const conditions = await solver.getConditions();
    const conditionId = conditions[conditions.length-1].conditionId

    // Seller should have all the success tokens
    const indexSetSuccess = getIndexSetFromBinaryArray([0,0,1]) // If success
    const indexSetFailure = getIndexSetFromBinaryArray([0,1,0]) // If failure
    const indexSetCancelled = getIndexSetFromBinaryArray([1,0,0]) // If cancelled


    console.log("index set success: ", indexSetSuccess)
    console.log("index set failure: ", indexSetFailure)

    const collectionIdSuccess = await this.CT.getCollectionId(ethers.constants.HashZero, conditionId, indexSetSuccess)
    const positionIdSuccess = await this.CT.getPositionId(this.ToyToken.address, collectionIdSuccess)
    const buyerSuccessBalance = await this.CT.balanceOf(this.buyer.address, positionIdSuccess)
    const sellerSuccessBalance = await this.CT.balanceOf(this.seller.address, positionIdSuccess)
    const keeperSuccessBalance = await this.CT.balanceOf(this.keeper.address, positionIdSuccess)
    expect(buyerSuccessBalance).to.equal(0)
    expect(sellerSuccessBalance).to.equal(90)
    expect(keeperSuccessBalance).to.equal(10)



    // Buyer should have all the failure tokens
    const collectionIdFailure = await this.CT.getCollectionId(ethers.constants.HashZero, conditionId, indexSetFailure)
    const positionIdFailure = await this.CT.getPositionId(this.ToyToken.address, collectionIdFailure)
    const buyerFailureBalance = await this.CT.balanceOf(this.buyer.address, positionIdFailure)
    const sellerFailureBalance = await this.CT.balanceOf(this.seller.address, positionIdFailure)
    const keeperFailureBalance = await this.CT.balanceOf(this.keeper.address, positionIdFailure)
    expect(buyerFailureBalance).to.equal(100)
    expect(sellerFailureBalance).to.equal(0)
    expect(keeperFailureBalance).to.equal(0)



    // Keeper gets 10 if job cancelled
    const collectionIdCancelled = await this.CT.getCollectionId(ethers.constants.HashZero, conditionId, indexSetCancelled)
    const positionIdCancelled = await this.CT.getPositionId(this.ToyToken.address, collectionIdCancelled)
    const buyerCancelledBalance = await this.CT.balanceOf(this.buyer.address, positionIdCancelled)
    const sellerCancelledBalance = await this.CT.balanceOf(this.seller.address, positionIdCancelled)
    const keeperCancelledBalance = await this.CT.balanceOf(this.keeper.address, positionIdCancelled)
    expect(buyerCancelledBalance).to.equal(90)
    expect(sellerCancelledBalance).to.equal(0)
    expect(keeperCancelledBalance).to.equal(10)


    // Keeper proposes payouts
    await solver.connect(this.keeper).proposePayouts(0, [0,0,1]);

    const conditionsProposed = await solver.getConditions();
    const payouts = conditionsProposed[conditionsProposed.length-1].payouts;

    // We set timelock to 0, so confirm right away
    await solver.connect(this.keeper).confirmPayouts(0);

    // Seller redeems tokens
    await this.CT.connect(this.seller).redeemPositions(this.ToyToken.address, ethers.constants.HashZero, conditionId, [indexSetSuccess, indexSetFailure, indexSetCancelled])
    const sellerERC20Balance = await this.ToyToken.balanceOf(this.seller.address);
    expect(sellerERC20Balance).to.equal(90);
  });

  it("Correctly allocates less recipients than partitions", async function () {
    //Create solution
    const solutionId = ethers.utils.formatBytes32String("TestID")
  
    /////////INGESTS & ACTIONS & CONFIG ///////////////
    const ingests0 = [
      {
        executions: 0,
        isDeferred: false,
        isConstant: true,
        dataType: 0,
        key: 1,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['address'], [this.buyer.address])
      },
      {
        executions: 0,
        isDeferred: false,
        isConstant: true,
        dataType: 0,
        key: 2,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['address'], [this.seller.address])
      },
      {
        executions: 0,
        isConstant: true,
        dataType: 4,
        key: 4,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['uint256'], [0])
      },
      {
        executions: 0,
        isConstant: true,
        dataType: 4,
        key: 5,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['uint256'], [10])
      },
      {
        executions: 0,
        isConstant: true,
        dataType: 4,
        key: 6,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['uint256'], [90])
      },
      {
        executions: 0,
        isConstant: true,
        dataType: 4,
        key: 7,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['uint256'], [100])
      }
    ]

    const canon0 = {
      collateralToken: this.ToyToken.address,
      outcomeSlots: 3,
      parentCollectionIndexSet: 0,
      amount: 100,
      partition: [4,2,1], // Good, Bad, Cancelled
      recipientAddressSlots: [1,2], // Buyer, Seller
      recipientAmountSlots: [[4,7],[7,4],[6,5]],
      conditionURI: ""
    }

    const solverConfigs = [
      [
        this.Solver.address,
        this.keeper.address,
        this.arbitrator.address,
        0,
        ethers.utils.formatBytes32String(""),
        ingests0,
        canon0
      ]
    ];

    await this.SolutionsHub.connect(this.keeper).createSolution(
      solutionId,
      this.ToyToken.address,
      solverConfigs
    );
 

    //Create proposal
    let tx2 = await this.ProposalsHub.connect(this.keeper).createProposal(
      this.ToyToken.address,
      this.SolutionsHub.address,
      100,
      solutionId
    );
    let receipt2 = await tx2.wait();
    let iface2 = new ethers.utils.Interface([
      "event CreateProposal(bytes32 id)",
    ]);
    const proposalId = iface2.parseLog(receipt2.logs[0]).args.id;
    const proposal = await this.ProposalsHub.getProposal(proposalId);

    //Fund and execute Proposal
    await this.ToyToken.connect(this.buyer).approve(
      this.ProposalsHub.address,
      100
    );
    await this.ProposalsHub.connect(this.buyer).fundProposal(
      proposalId,
      this.ToyToken.address,
      100
    );

    await this.ProposalsHub.executeProposal(proposalId);

    const solverAddress = await this.SolutionsHub.solverFromIndex(solutionId, 0);
    const solverERC20Balance = await this.ToyToken.balanceOf(solverAddress);
    const CTERC20Balance = await this.ToyToken.balanceOf(this.CT.address);
    // Collateral has been sent to CT contract
    expect(solverERC20Balance).to.equal(0);
    expect(CTERC20Balance).to.equal(100);


    // Connect to our Prime Solver
    let solver = new ethers.Contract(solverAddress, SOLVER_ABI, ethers.provider);

    const conditions = await solver.getConditions();
    const conditionId = conditions[conditions.length-1].conditionId

    // Seller should have all the success tokens
    const indexSetSuccess = getIndexSetFromBinaryArray([0,0,1]) // If success
    const indexSetFailure = getIndexSetFromBinaryArray([0,1,0]) // If failure
    const indexSetCancelled = getIndexSetFromBinaryArray([1,0,0]) // If cancelled


    console.log("index set success: ", indexSetSuccess)
    console.log("index set failure: ", indexSetFailure)

    const collectionIdSuccess = await this.CT.getCollectionId(ethers.constants.HashZero, conditionId, indexSetSuccess)
    const positionIdSuccess = await this.CT.getPositionId(this.ToyToken.address, collectionIdSuccess)
    const buyerSuccessBalance = await this.CT.balanceOf(this.buyer.address, positionIdSuccess)
    const sellerSuccessBalance = await this.CT.balanceOf(this.seller.address, positionIdSuccess)
    expect(buyerSuccessBalance).to.equal(0)
    expect(sellerSuccessBalance).to.equal(100)



    // Buyer should have all the failure tokens
    const collectionIdFailure = await this.CT.getCollectionId(ethers.constants.HashZero, conditionId, indexSetFailure)
    const positionIdFailure = await this.CT.getPositionId(this.ToyToken.address, collectionIdFailure)
    const buyerFailureBalance = await this.CT.balanceOf(this.buyer.address, positionIdFailure)
    const sellerFailureBalance = await this.CT.balanceOf(this.seller.address, positionIdFailure)
    expect(buyerFailureBalance).to.equal(100)
    expect(sellerFailureBalance).to.equal(0)



    // Keeper gets 10 if job cancelled
    const collectionIdCancelled = await this.CT.getCollectionId(ethers.constants.HashZero, conditionId, indexSetCancelled)
    const positionIdCancelled = await this.CT.getPositionId(this.ToyToken.address, collectionIdCancelled)
    const buyerCancelledBalance = await this.CT.balanceOf(this.buyer.address, positionIdCancelled)
    const sellerCancelledBalance = await this.CT.balanceOf(this.seller.address, positionIdCancelled)
    expect(buyerCancelledBalance).to.equal(90)
    expect(sellerCancelledBalance).to.equal(10)


    // Keeper proposes payouts
    await solver.connect(this.keeper).proposePayouts(0,[0,0,1]);

    const conditionsProposed = await solver.getConditions();
    const payouts = conditionsProposed[conditionsProposed.length-1].payouts;

    // We set timelock to 0, so confirm right away
    await solver.connect(this.keeper).confirmPayouts(0);

    // Seller redeems tokens
    await this.CT.connect(this.seller).redeemPositions(this.ToyToken.address, ethers.constants.HashZero, conditionId, [indexSetSuccess, indexSetFailure, indexSetCancelled])
    const sellerERC20Balance = await this.ToyToken.balanceOf(this.seller.address);
    expect(sellerERC20Balance).to.equal(100);
  });


  it("Correctly allocates more recipients than partitions", async function () {
    //Create solution
    const solutionId = ethers.utils.formatBytes32String("TestID")
  
    /////////INGESTS & ACTIONS & CONFIG ///////////////
    const ingests0 = [
      {
        executions: 0,
        isDeferred: false,
        isConstant: true,
        dataType: 0,
        key: 1,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['address'], [this.buyer.address])
      },
      {
        executions: 0,
        isDeferred: false,
        isConstant: true,
        dataType: 0,
        key: 2,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['address'], [this.seller.address])
      },
      {
        executions: 0,
        isDeferred: false,
        isConstant: true,
        dataType: 0,
        key: 3,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['address'], [this.keeper.address])
      },
      {
        executions: 0,
        isConstant: true,
        dataType: 4,
        key: 4,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['uint256'], [0])
      },
      {
        executions: 0,
        isConstant: true,
        dataType: 4,
        key: 5,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['uint256'], [10])
      },
      {
        executions: 0,
        isConstant: true,
        dataType: 4,
        key: 6,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['uint256'], [90])
      },
      {
        executions: 0,
        isConstant: true,
        dataType: 4,
        key: 7,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['uint256'], [100])
      }
    ]

    const canon0 = {
      collateralToken: this.ToyToken.address,
      outcomeSlots: 2,
      parentCollectionIndexSet: 0,
      amount: 100,
      partition: [1,2], // Good, Bad
      recipientAddressSlots: [1,2,3], // Buyer, Seller, Keeper
      recipientAmountSlots: [[4,6,5],[7,4,4]],
      conditionURI: ""
    }
    

    const solverConfigs = [
      [
        this.Solver.address,
        this.keeper.address,
        this.arbitrator.address,
        0,
        ethers.utils.formatBytes32String(""),
        ingests0,
        canon0
      ]
    ];

    await this.SolutionsHub.connect(this.keeper).createSolution(
      solutionId,
      this.ToyToken.address,
      solverConfigs
    );
 

    //Create proposal
    let tx2 = await this.ProposalsHub.connect(this.keeper).createProposal(
      this.ToyToken.address,
      this.SolutionsHub.address,
      100,
      solutionId
    );
    let receipt2 = await tx2.wait();
    let iface2 = new ethers.utils.Interface([
      "event CreateProposal(bytes32 id)",
    ]);
    const proposalId = iface2.parseLog(receipt2.logs[0]).args.id;
    const proposal = await this.ProposalsHub.getProposal(proposalId);

    //Fund and execute Proposal
    await this.ToyToken.connect(this.buyer).approve(
      this.ProposalsHub.address,
      100
    );
    await this.ProposalsHub.connect(this.buyer).fundProposal(
      proposalId,
      this.ToyToken.address,
      100
    );

    await this.ProposalsHub.executeProposal(proposalId);

    const solverAddress = await this.SolutionsHub.solverFromIndex(solutionId, 0);
    const solverERC20Balance = await this.ToyToken.balanceOf(solverAddress);
    const CTERC20Balance = await this.ToyToken.balanceOf(this.CT.address);
    // Collateral has been sent to CT contract
    expect(solverERC20Balance).to.equal(0);
    expect(CTERC20Balance).to.equal(100);


    // Connect to our Prime Solver
    let solver = new ethers.Contract(solverAddress, SOLVER_ABI, ethers.provider);

    const conditions = await solver.getConditions();
    const conditionId = conditions[conditions.length-1].conditionId

    // Seller should have all the success tokens
    const indexSetSuccess = getIndexSetFromBinaryArray([1,0]) // If success
    const indexSetFailure = getIndexSetFromBinaryArray([0,1]) // If failure


    console.log("index set success: ", indexSetSuccess)
    console.log("index set failure: ", indexSetFailure)

    const collectionIdSuccess = await this.CT.getCollectionId(ethers.constants.HashZero, conditionId, indexSetSuccess)
    const positionIdSuccess = await this.CT.getPositionId(this.ToyToken.address, collectionIdSuccess)
    const buyerSuccessBalance = await this.CT.balanceOf(this.buyer.address, positionIdSuccess)
    const sellerSuccessBalance = await this.CT.balanceOf(this.seller.address, positionIdSuccess)
    const keeperSuccessBalance = await this.CT.balanceOf(this.keeper.address, positionIdSuccess)
    console.log(buyerSuccessBalance.toString(), sellerSuccessBalance.toString(), keeperSuccessBalance.toString())
    expect(buyerSuccessBalance).to.equal(0)
    expect(sellerSuccessBalance).to.equal(90)
    expect(keeperSuccessBalance).to.equal(10)



    // Buyer should have all the failure tokens
    const collectionIdFailure = await this.CT.getCollectionId(ethers.constants.HashZero, conditionId, indexSetFailure)
    const positionIdFailure = await this.CT.getPositionId(this.ToyToken.address, collectionIdFailure)
    const buyerFailureBalance = await this.CT.balanceOf(this.buyer.address, positionIdFailure)
    const sellerFailureBalance = await this.CT.balanceOf(this.seller.address, positionIdFailure)
    expect(buyerFailureBalance).to.equal(100)
    expect(sellerFailureBalance).to.equal(0)


    // Keeper proposes payouts
    await solver.connect(this.keeper).proposePayouts(0,[1,0]);

    const conditionsProposed = await solver.getConditions();
    const payouts = conditionsProposed[conditionsProposed.length-1].payouts;

    // We set timelock to 0, so confirm right away
    await solver.connect(this.keeper).confirmPayouts(0);

    // Seller redeems tokens
    await this.CT.connect(this.seller).redeemPositions(this.ToyToken.address, ethers.constants.HashZero, conditionId, [indexSetSuccess, indexSetFailure])
    const sellerERC20Balance = await this.ToyToken.balanceOf(this.seller.address);
    expect(sellerERC20Balance).to.equal(90);
  });

});

