const { ethers, deployments } = require("hardhat");
const { expect } = require("chai");
const SOLVER_ABI = require("../artifacts/contracts/Solver.sol/Solver.json").abi;
const SOLUTIONSHUB_ABI = require("../artifacts/contracts/SolutionsHub.sol/SolutionsHub.json").abi;
const { FormatTypes } = require("ethers/lib/utils");
const { getIndexSetFromBinaryArray } = require("../helpers/ConditionalTokens.js")


describe("It should all work", function () {



  this.beforeEach( async function () {
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


  it("Should execute two-solver Proposal", async function () {
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
        isConstant: false,
        dataType: 0,
        key: 2,
        solverIndex: 1,
        data: this.ISolver.encodeFunctionData("addressFromChainIndex",[1])
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

    const conditionBase0 = {
      collateralToken: this.ToyToken.address,
      outcomeSlots: 2,
      parentCollectionIndexSet: 0,
      amountSlot: 4,
      partition: [1,2],
      recipientAddressSlots: [1,2],
      recipientAmountSlots: [[3,4],[4,3]],
      conditionURI: ""
    }
  
    // Second Solver
    const ingests1 = [
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

    const conditionBase1 = {
      collateralToken: this.ToyToken.address,
      outcomeSlots: 2,
      parentCollectionIndexSet: 1,
      amountSlot: 4,
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
        conditionBase0
      ],
      [
        this.Solver.address,
        this.keeper.address,
        this.arbitrator.address,
        0,
        ethers.utils.formatBytes32String(""),
        ingests1,
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


    const conditions0 = await solver0.getConditions();
    const conditionId0 = conditions0[conditions0.length-1].conditionId

    const collectionId0Success = await this.CT.getCollectionId(ethers.constants.HashZero, conditionId0, indexSetSuccess)
    const positionId0Success = await this.CT.getPositionId(this.ToyToken.address, collectionId0Success)

    const conditions1 = await solver1.getConditions();
    const conditionId1 = conditions1[conditions1.length-1].conditionId

    const collectionId1Success = await this.CT.getCollectionId(collectionId0Success, conditionId1, indexSetSuccess)
    const positionIdSuccess = await this.CT.getPositionId(this.ToyToken.address, collectionId1Success)

    const buyerSuccessBalance = await this.CT.balanceOf(this.buyer.address, positionIdSuccess)
    const sellerSuccessBalance = await this.CT.balanceOf(this.seller.address, positionIdSuccess)
    expect(buyerSuccessBalance).to.equal(0)
    expect(sellerSuccessBalance).to.equal(100)
  
    // Keeper proposes payouts
    await solver0.connect(this.keeper).proposePayouts(0,[1,0]);
    const conditions0Proposed = await solver0.getConditions();
    const payouts0 = conditions0Proposed[conditions0Proposed.length-1].payouts;
    expect(payouts0[0]).to.equal(1)
    expect(payouts0[1]).to.equal(0)

    await solver1.connect(this.keeper).proposePayouts(0, [1,0]);
    const conditions1Proposed = await solver0.getConditions();
    const payouts1 = conditions1Proposed[conditions1Proposed.length-1].payouts;
    expect(payouts1[0]).to.equal(1)
    expect(payouts1[1]).to.equal(0)
  
    // We set timelock to 0, so confirm right away
    await solver0.connect(this.keeper).confirmPayouts(0);
    await solver1.connect(this.keeper).confirmPayouts(0);

    await this.CT.connect(this.seller).redeemPositions(this.ToyToken.address, collectionId0Success, conditionId1, [indexSetSuccess, indexSetFailure])
    const sellerCT0SuccessBalance = await this.CT.balanceOf(this.seller.address, positionId0Success);
    expect(sellerCT0SuccessBalance).to.equal(100)

    // Seller redeems tokens
    await this.CT.connect(this.seller).redeemPositions(this.ToyToken.address, collectionId0Success, conditionId1, [indexSetSuccess, indexSetFailure])
    await this.CT.connect(this.seller).redeemPositions(this.ToyToken.address, ethers.constants.HashZero, conditionId0, [indexSetSuccess, indexSetFailure])
    const sellerERC20Balance = await this.ToyToken.balanceOf(this.seller.address);
    expect(sellerERC20Balance).to.equal(100);
  });
});

