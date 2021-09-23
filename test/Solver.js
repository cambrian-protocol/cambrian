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

    await deployments.fixture(["ConditionalTokens", "SolverFactory", "SolutionsHub", "ProposalsHub", "ToyToken", "Solver"]);
    this.CT = await ethers.getContract("ConditionalTokens")
    this.SolverFactory = await ethers.getContract("SolverFactory")
    this.SolutionsHub = await ethers.getContract("SolutionsHub")
    this.ProposalsHub = await ethers.getContract("ProposalsHub")
    this.ToyToken = await ethers.getContract("ToyToken")
    this.Solver = await ethers.getContract("Solver")

    await this.ToyToken.mint(this.buyer.address, "100");


    this.ISolver = new ethers.utils.Interface(SOLVER_ABI);
    this.ISolver.format(FormatTypes.full);

    this.ISolutionsHub = new ethers.utils.Interface(SOLUTIONSHUB_ABI);
    this.ISolutionsHub.format(FormatTypes.full);
  });

  it("Should execute single-solver Proposal", async function () {
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
        data: ethers.utils.defaultAbiCoder.encode(['address'], [this.buyer.address])
      },
      {
        executions: 0,
        isDeferred: false,
        isConstant: true,
        port: 0,
        key: 2,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['address'], [this.seller.address])
      },
      {
        executions: 0,
        isConstant: true,
        port: 3,
        key: 0,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['bytes32'], [ethers.utils.formatBytes32String("")])
      }
    ]

    const actions0 = [];

    const canon0 = {
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
        this.Solver.address,
        this.keeper.address,
        this.arbitrator.address,
        0,
        ethers.utils.formatBytes32String(""),
        ingests0,
        actions0,
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
    await solver.connect(this.keeper).proposePayouts([1,0]);

    const conditionsProposed = await solver.getConditions();
    const payouts = conditionsProposed[conditionsProposed.length-1].payouts;
    expect(payouts[0]).to.equal(1)
    expect(payouts[1]).to.equal(0)

    // We set timelock to 0, so confirm right away
    await solver.connect(this.keeper).confirmPayouts();

    // Seller redeems tokens
    await this.CT.connect(this.seller).redeemPositions(this.ToyToken.address, ethers.constants.HashZero, conditionId, [indexSetSuccess, indexSetFailure])
    const sellerERC20Balance = await this.ToyToken.balanceOf(this.seller.address);
    expect(sellerERC20Balance).to.equal(100);


  });

});

