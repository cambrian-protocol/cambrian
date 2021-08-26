const { ethers } = require("hardhat");
const { expect } = require("chai");
const SOLVER_ABI = require("../artifacts/contracts/Solver.sol/Solver.json").abi;
const SOLUTIONSHUB_ABI = require("../artifacts/contracts/SolutionsHub.sol/SolutionsHub.json").abi;
const { FormatTypes } = require("ethers/lib/utils");
const { getIndexSetFromBinaryArray } = require("../helpers/ConditionalTokens.js")


describe("It should all work", function () {
  this.beforeEach(async function () {
    
    const [buyer, seller, keeper, arbiter] = await ethers.getSigners();
    this.buyer = buyer;
    this.seller = seller;
    this.keeper = keeper;
    this.arbiter = arbiter;

    this.ToyTokenFactory = await ethers.getContractFactory("ToyToken");
    this.ToyToken = await this.ToyTokenFactory.deploy("TOY", "TOY");
    await this.ToyToken.mint(this.buyer.address, "100");

    this.CTFactory = await ethers.getContractFactory("ConditionalTokens");
    this.CT = await this.CTFactory.deploy();

    this.ProposalsHubFactory = await ethers.getContractFactory("ProposalsHub");
    this.ProposalsHub = await this.ProposalsHubFactory.deploy();

    this.SolutionsHubFactory = await ethers.getContractFactory("SolutionsHub");
    this.SolutionsHub = await this.SolutionsHubFactory.deploy(this.CT.address);

    // this.SolverImplementationFactory = await ethers.getContractFactory("Solver");
    // this.SolverImplementation = await this.SolverImplementationFactory.deploy();

    this.SolverFactoryFactory = await ethers.getContractFactory(
      "SolverFactory"
    );
    this.SolverFactory = await this.SolverFactoryFactory.deploy();

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
        executed: false,
        isConstant: true,
        port: 0,
        key: 1,
        solverIndex: 0,
        data: this.buyer.address
      },
      {
        executed: false,
        isConstant: true,
        port: 0,
        key: 2,
        solverIndex: 0,
        data: this.seller.address
      },
      {
        executed: false,
        isConstant: true,
        port: 3,
        key: 0,
        solverIndex: 0,
        data: ethers.utils.formatBytes32String("")
      }
    ]

    const actions0 = [
      [
        false, // bool executed
        true, // isPort
        ethers.constants.AddressZero, // to address
        0, // portIndex. 0 is equal to address(this)
        0, // value
        this.ISolver.encodeFunctionData("executeCanonCondition", []),
      ]
    ];

    const canon0 = {
      outcomeSlots: 2,
      parentCollectionIdPort: 0,
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
        this.arbiter.address,
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

    const primeSolverAddress = await this.SolutionsHub.solverFromIndex(solutionId, 0);
    const solverERC20Balance = await this.ToyToken.balanceOf(primeSolverAddress);
    const CTERC20Balance = await this.ToyToken.balanceOf(this.CT.address);
    // Collateral has been sent to CT contract
    expect(solverERC20Balance).to.equal(0);
    expect(CTERC20Balance).to.equal(100);


    // Connect to our Prime Solver
    let primeSolver = new ethers.Contract(primeSolverAddress, SOLVER_ABI, ethers.provider);

    const condition = await primeSolver.canonCondition()
    const conditionId = condition['conditionId']

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
    await primeSolver.connect(this.keeper).proposePayouts([1,0]);
    const payouts = await primeSolver.getPayouts();
    expect(payouts[0]).to.equal(1)
    expect(payouts[1]).to.equal(0)

    // We set timelock to 0, so confirm right away
    await primeSolver.connect(this.keeper).confirmPayouts();

    // Seller redeems tokens
    await this.CT.connect(this.seller).redeemPositions(this.ToyToken.address, ethers.constants.HashZero, conditionId, [indexSetSuccess, indexSetFailure])
    const sellerERC20Balance = await this.ToyToken.balanceOf(this.seller.address);
    expect(sellerERC20Balance).to.equal(100);
  });

});

