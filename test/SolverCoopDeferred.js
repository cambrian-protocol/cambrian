const { ethers, deployments } = require("hardhat");
const { expect } = require("chai");
const SOLVER_ABI = require("../artifacts/contracts/Solver.sol/Solver.json").abi;
const SOLUTIONSHUB_ABI = require("../artifacts/contracts/SolutionsHub.sol/SolutionsHub.json").abi;
const { FormatTypes } = require("ethers/lib/utils");
const { getIndexSetFromBinaryArray } = require("../helpers/ConditionalTokens.js")


describe("It should all work", async function () {
  this.beforeEach(async function () {
    
    const [buyer, seller, keeper, arbitrator] = await ethers.getSigners();

    
    this.buyer = buyer;
    this.seller = seller;
    this.keeper = keeper;
    this.arbitrator = arbitrator;

    await deployments.fixture(["ConditionalTokens", "SolverFactory", "SolutionsHub", "ProposalsHub", "ToyToken"]);
    this.CT = await ethers.getContract("ConditionalTokens")
    this.SolverFactory = await ethers.getContract("SolverFactory")
    this.SolutionsHub = await ethers.getContract("SolutionsHub")
    this.ProposalsHub = await ethers.getContract("ProposalsHub")
    this.ToyToken = await ethers.getContract("ToyToken")
    
    await this.ToyToken.mint(this.buyer.address, "100");


    this.ISolver = new ethers.utils.Interface(SOLVER_ABI);
    this.ISolver.format(FormatTypes.full);

    this.ISolutionsHub = new ethers.utils.Interface(SOLUTIONSHUB_ABI);
    this.ISolutionsHub.format(FormatTypes.full);
  });


  it("Should execute two-solver Proposal with deferred proposal", async function () {
    //Create solution
    const solutionId = ethers.utils.formatBytes32String("TestID")
  
    /////////INGESTS & ACTIONS & CONFIG ///////////////
    const ingests0 = [
      {
        executions: 0,
        isDeferred: false,
        isConstant: true,
        port: 0,
        key: 1,
        solverIndex: 0,
        data: this.buyer.address
      },
      {
        executions: 0,
        isDeferred: false,
        isConstant: false,
        port: 0,
        key: 2,
        solverIndex: 0,
        data: this.ISolver.encodeFunctionData("solverAddressFromIndex",[1])
      }
    ]

    const actions0 = [];

    const conditionBase0 = {
      outcomeSlots: 2,
      parentCollectionPartitionIndex: 0,
      amount: 100,
      partition: [1,2],
      recipientAddressPorts: [[1,2],[1,2]],
      recipientAmounts: [[0,100],[100,0]],
      metadata: ""
    }
  
    // Second Solver
    const ingests1 = [
      {
        executions: 0,
        isDeferred: false,
        isConstant: true,
        port: 0,
        key: 1,
        solverIndex: 0,
        data: this.buyer.address
      },
      {
        executions: 0,
        isDeferred: false,
        isConstant: true,
        port: 0,
        key: 2,
        solverIndex: 0,
        data: this.seller.address
      },
      { // add arbitrary isDeferred data ingest
        executions: 0,
        isDeferred: true,
        isConstant: false,
        port: 2,
        key: 0,
        solverIndex: 0,
        data: this.ISolver.encodeFunctionData("getOutput",[2, 0])
      },
    ]
    const actions1 = [];

    const conditionBase1 = {
      outcomeSlots: 2,
      parentCollectionPartitionIndex: 0,
      amount: 100,
      partition: [1,2],
      recipientAddressPorts: [[1,2],[1,2]],
      recipientAmounts: [[0,100],[100,0]],
      metadata: ""
    }

  
    const solverConfigs = [
      [
        this.SolverFactory.address,
        this.keeper.address,
        this.arbitrator.address,
        0,
        ethers.utils.formatBytes32String(""),
        ingests0,
        actions0,
        conditionBase0
      ],
      [
        this.SolverFactory.address,
        this.keeper.address,
        this.arbitrator.address,
        0,
        ethers.utils.formatBytes32String(""),
        ingests1,
        actions1,
        conditionBase1
      ],
    ];
    //////////////////////////////////////////
  
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
  
    const solver0Address = await this.SolutionsHub.solverFromIndex(solutionId, 0);
    const solver1Address = await this.SolutionsHub.solverFromIndex(solutionId, 1);

    const solverERC20Balance = await this.ToyToken.balanceOf(solver0Address);
    const CTERC20Balance = await this.ToyToken.balanceOf(this.CT.address);
    // Collateral has been sent to CT contract
    expect(solverERC20Balance).to.equal(0);
    expect(CTERC20Balance).to.equal(100);
  
    
    // Seller should have all the success tokens
    const indexSetSuccess = getIndexSetFromBinaryArray([1,0]) // If success
    const indexSetFailure = getIndexSetFromBinaryArray([0,1]) // If failure
  
    console.log("index set success: ", indexSetSuccess)
    console.log("index set failure: ", indexSetFailure)

    let solver0 = new ethers.Contract(solver0Address, SOLVER_ABI, ethers.provider);
    let solver1 = new ethers.Contract(solver1Address, SOLVER_ABI, ethers.provider);


    // Add deferred data to solver0 and fetch it from solver1
    await solver0.connect(this.keeper).addData(2, 0, ethers.constants.HashZero);
    await solver1.connect(this.keeper).ingest(2);
    await solver1.connect(this.keeper).executeSolve();



    const numConditions0 = await solver0.numConditions()
    const condition0 = await solver0.conditions(numConditions0-1)
    const conditionId0 = condition0['conditionId']
    const collectionId0Success = await this.CT.getCollectionId(ethers.constants.HashZero, conditionId0, indexSetSuccess)
    const positionId0Success = await this.CT.getPositionId(this.ToyToken.address, collectionId0Success)


    const numConditions1 = await solver1.numConditions()
    const condition1 = await solver1.conditions(numConditions1-1)
    const conditionId1 = condition1['conditionId']
    const collectionId1Success = await this.CT.getCollectionId(collectionId0Success, conditionId1, indexSetSuccess)
    const positionIdSuccess = await this.CT.getPositionId(this.ToyToken.address, collectionId1Success)

    const buyerSuccessBalance = await this.CT.balanceOf(this.buyer.address, positionIdSuccess)
    const sellerSuccessBalance = await this.CT.balanceOf(this.seller.address, positionIdSuccess)
    expect(buyerSuccessBalance).to.equal(0)
    expect(sellerSuccessBalance).to.equal(100)
  
  
    // // Buyer should have all the failure tokens
    // const collectionIdFailure = await this.CT.getCollectionId(ethers.constants.HashZero, conditionId, indexSetFailure)
    // const positionIdFailure = await this.CT.getPositionId(this.ToyToken.address, collectionIdFailure)
    // const buyerFailureBalance = await this.CT.balanceOf(this.buyer.address, positionIdFailure)
    // const sellerFailureBalance = await this.CT.balanceOf(this.seller.address, positionIdFailure)
    // expect(buyerFailureBalance).to.equal(100)
    // expect(sellerFailureBalance).to.equal(0)
  
    // Keeper proposes payouts
    await solver0.connect(this.keeper).proposePayouts([1,0]);
    const payouts0 = await solver0.getPayouts();
    expect(payouts0[0]).to.equal(1)
    expect(payouts0[1]).to.equal(0)

    await solver1.connect(this.keeper).proposePayouts([1,0]);
    const payouts1 = await solver0.getPayouts();
    expect(payouts1[0]).to.equal(1)
    expect(payouts1[1]).to.equal(0)
  
    // We set timelock to 0, so confirm right away
    await solver0.connect(this.keeper).confirmPayouts();
    await solver1.connect(this.keeper).confirmPayouts();

    await this.CT.connect(this.seller).redeemPositions(this.ToyToken.address, collectionId0Success, conditionId1, [indexSetSuccess, indexSetFailure])
    const sellerCT0SuccessBalance = await this.CT.balanceOf(this.seller.address, positionId0Success);
    expect(sellerCT0SuccessBalance).to.equal(100)

  
    // // Buyer redeems tokens
    // await this.CT.connect(this.buyer).redeemPositions(this.ToyToken.address, collectionId0Success, conditionId1, [indexSetSuccess, indexSetFailure])
    // const buyerERC20Balance = await this.ToyToken.balanceOf(this.buyer.address);
    // expect(buyerERC20Balance).to.equal(0);

    // Seller redeems tokens
    await this.CT.connect(this.seller).redeemPositions(this.ToyToken.address, collectionId0Success, conditionId1, [indexSetSuccess, indexSetFailure])
    await this.CT.connect(this.seller).redeemPositions(this.ToyToken.address, ethers.constants.HashZero, conditionId0, [indexSetSuccess, indexSetFailure])
    const sellerERC20Balance = await this.ToyToken.balanceOf(this.seller.address);
    expect(sellerERC20Balance).to.equal(100);
  });
});

