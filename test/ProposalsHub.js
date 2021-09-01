const { ethers } = require("hardhat");
const { expect } = require("chai");
const SOLVER_ABI = require("../artifacts/contracts/Solver.sol/Solver.json").abi;
const SOLUTIONSHUB_ABI = require("../artifacts/contracts/SolutionsHub.sol/SolutionsHub.json").abi;
const { FormatTypes } = require("ethers/lib/utils");
const { getIndexSetFromBinaryArray } = require("../helpers/ConditionalTokens.js")
const { getSimpleSolutionConfig } = require("../helpers/testHelpers.js")
const {
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

describe("It should all work", function () {
  this.beforeEach(async function () {
    
    const [user0, user1, seller, keeper, arbiter] = await ethers.getSigners();
    this.user0 = user0;
    this.user1 = user1;
    this.seller = seller;
    this.keeper = keeper;
    this.arbiter = arbiter;
    this.amount = 1000;

    this.ToyTokenFactory = await ethers.getContractFactory("ToyToken");
    this.ToyToken = await this.ToyTokenFactory.deploy("TOY", "TOY");
    await this.ToyToken.mint(this.user0.address, this.amount);
    await this.ToyToken.mint(this.user1.address, this.amount);


    this.CTFactory = await ethers.getContractFactory("ConditionalTokens");
    this.CT = await this.CTFactory.deploy();

    this.ProposalsHubFactory = await ethers.getContractFactory("ProposalsHub");
    this.ProposalsHub = await this.ProposalsHubFactory.deploy();

    this.SolutionsHubFactory = await ethers.getContractFactory("SolutionsHub");
    this.SolutionsHub = await this.SolutionsHubFactory.deploy(this.CT.address);


    this.SolverFactoryFactory = await ethers.getContractFactory(
      "SolverFactory"
    );
    this.SolverFactory = await this.SolverFactoryFactory.deploy();

    this.ISolver = new ethers.utils.Interface(SOLVER_ABI);
    this.ISolver.format(FormatTypes.full);

    this.ISolutionsHub = new ethers.utils.Interface(SOLUTIONSHUB_ABI);
    this.ISolutionsHub.format(FormatTypes.full);


    //Create solution
    this.solutionId = ethers.utils.formatBytes32String("TestID")

    await this.SolutionsHub.connect(this.keeper).createSolution(
      ...getSimpleSolutionConfig(this.solutionId, this.amount, this.SolverFactory.address, this.keeper.address, this.arbiter.address, this.ProposalsHub.address, this.seller.address, this.ToyToken.address)
    );
  });

  it("Should fund a proposal", async function () {

    //Create proposal
    let tx2 = await this.ProposalsHub.connect(this.keeper).createProposal(
      this.ToyToken.address,
      this.SolutionsHub.address,
      this.amount,
      this.solutionId
    );
    let receipt2 = await tx2.wait();
    let iface2 = new ethers.utils.Interface([
      "event CreateProposal(bytes32 id)",
    ]);
    const proposalId = iface2.parseLog(receipt2.logs[0]).args.id;

    //Fund Proposal
    await this.ToyToken.connect(this.user0).approve(
      this.ProposalsHub.address,
      this.amount/2
    );
    await this.ProposalsHub.connect(this.user0).fundProposal(
      proposalId,
      this.ToyToken.address,
      this.amount/2
    );

    let user0funding = await this.ProposalsHub.funderAmountMap(proposalId, this.user0.address)
    expect(user0funding).to.equal(this.amount/2)

    await this.ToyToken.connect(this.user1).approve(
      this.ProposalsHub.address,
      this.amount/2
    );
    await this.ProposalsHub.connect(this.user1).fundProposal(
      proposalId,
      this.ToyToken.address,
      this.amount/2
    );
    let user1funding = await this.ProposalsHub.funderAmountMap(proposalId, this.user1.address)
    expect(user1funding).to.equal(this.amount/2)

    let proposal = await this.ProposalsHub.proposals(proposalId);
    expect(proposal.funding).to.equal(this.amount);
    
    let proposalHubBalance = await this.ToyToken.balanceOf(this.ProposalsHub.address);
    expect(proposalHubBalance).to.equal(this.amount);
  });

  it("Should fund and defund a proposal", async function () {

    //Create proposal
    let tx2 = await this.ProposalsHub.connect(this.keeper).createProposal(
      this.ToyToken.address,
      this.SolutionsHub.address,
      this.amount,
      this.solutionId
    );
    let receipt2 = await tx2.wait();
    let iface2 = new ethers.utils.Interface([
      "event CreateProposal(bytes32 id)",
    ]);
    const proposalId = iface2.parseLog(receipt2.logs[0]).args.id;

    //Fund Proposal
    await this.ToyToken.connect(this.user0).approve(
      this.ProposalsHub.address,
      this.amount/2
    );
    await this.ProposalsHub.connect(this.user0).fundProposal(
      proposalId,
      this.ToyToken.address,
      this.amount/2
    );

    let user0funding = await this.ProposalsHub.funderAmountMap(proposalId, this.user0.address)
    expect(user0funding).to.equal(this.amount/2)

    await this.ToyToken.connect(this.user1).approve(
      this.ProposalsHub.address,
      this.amount/2
    );
    await this.ProposalsHub.connect(this.user1).fundProposal(
      proposalId,
      this.ToyToken.address,
      this.amount/2
    );

    await this.ProposalsHub.connect(this.user1).defundProposal(
      proposalId, this.ToyToken.address, this.amount/2
    )

    let proposalHubBalance = await this.ToyToken.balanceOf(this.ProposalsHub.address);
    expect(proposalHubBalance).to.equal(this.amount/2);

    let proposal = await this.ProposalsHub.proposals(proposalId);
    expect(proposal.funding).to.equal(this.amount/2);

    user1funding = await this.ProposalsHub.funderAmountMap(proposalId, this.user1.address)
    expect(user1funding).to.equal(0)

  });

  it('reverts when executing if funding is not met', async function () {
    //Create proposal
    let tx2 = await this.ProposalsHub.connect(this.keeper).createProposal(
      this.ToyToken.address,
      this.SolutionsHub.address,
      this.amount,
      this.solutionId
    );
    let receipt2 = await tx2.wait();
    let iface2 = new ethers.utils.Interface([
      "event CreateProposal(bytes32 id)",
    ]);
    const proposalId = iface2.parseLog(receipt2.logs[0]).args.id;

    //Fund Proposal
    await this.ToyToken.connect(this.user0).approve(
      this.ProposalsHub.address,
      this.amount/2
    );
    await this.ProposalsHub.connect(this.user0).fundProposal(
      proposalId,
      this.ToyToken.address,
      this.amount/2
    );

    await expectRevert(this.ProposalsHub.executeProposal(proposalId), "Proposal not fully funded");
  });

  it('can receive conditional tokens from a Solver', async function () {
    //Create proposal
    let tx2 = await this.ProposalsHub.connect(this.keeper).createProposal(
      this.ToyToken.address,
      this.SolutionsHub.address,
      this.amount,
      this.solutionId
    );
    let receipt2 = await tx2.wait();
    let iface2 = new ethers.utils.Interface([
      "event CreateProposal(bytes32 id)",
    ]);
    const proposalId = iface2.parseLog(receipt2.logs[0]).args.id;

    //Fund Proposal
    await this.ToyToken.connect(this.user0).approve(
      this.ProposalsHub.address,
      this.amount
    );
    await this.ProposalsHub.connect(this.user0).fundProposal(
      proposalId,
      this.ToyToken.address,
      this.amount
    );

    await this.ProposalsHub.executeProposal(proposalId);

    const solverAddress = await this.SolutionsHub.solverFromIndex(this.solutionId, 0);
    let solver = new ethers.Contract(solverAddress, SOLVER_ABI, ethers.provider);
    const numConditions = await solver.numConditions()
    const condition = await solver.conditions(numConditions-1)
    const conditionId = condition['conditionId']

    const indexSetFailure = getIndexSetFromBinaryArray([0,1]) // If failure
    const collectionIdFailure = await this.CT.getCollectionId(ethers.constants.HashZero, conditionId, indexSetFailure)
    const positionIdFailure = await this.CT.getPositionId(this.ToyToken.address, collectionIdFailure)

    let ProposalsHubCTBalance = await this.CT.balanceOf(this.ProposalsHub.address, positionIdFailure)
    expect(ProposalsHubCTBalance).to.equal(1000);
  });

  it('conditional tokens can be reclaimed from the Proposal', async function () {
    //Create proposal
    let tx2 = await this.ProposalsHub.connect(this.keeper).createProposal(
      this.ToyToken.address,
      this.SolutionsHub.address,
      this.amount,
      this.solutionId
    );
    let receipt2 = await tx2.wait();
    let iface2 = new ethers.utils.Interface([
      "event CreateProposal(bytes32 id)",
    ]);
    const proposalId = iface2.parseLog(receipt2.logs[0]).args.id;

    //Fund Proposal
    await this.ToyToken.connect(this.user0).approve(
      this.ProposalsHub.address,
      this.amount
    );
    await this.ProposalsHub.connect(this.user0).fundProposal(
      proposalId,
      this.ToyToken.address,
      this.amount
    );

    await this.ProposalsHub.executeProposal(proposalId);

    const solverAddress = await this.SolutionsHub.solverFromIndex(this.solutionId, 0);
    let solver = new ethers.Contract(solverAddress, SOLVER_ABI, ethers.provider);
    const numConditions = await solver.numConditions()
    const condition = await solver.conditions(numConditions-1)
    const conditionId = condition['conditionId']

    const indexSetFailure = getIndexSetFromBinaryArray([0,1]) // If failure
    const collectionIdFailure = await this.CT.getCollectionId(ethers.constants.HashZero, conditionId, indexSetFailure)
    const positionIdFailure = await this.CT.getPositionId(this.ToyToken.address, collectionIdFailure)

    let ProposalsHubCTBalance = await this.CT.balanceOf(this.ProposalsHub.address, positionIdFailure)
    expect(ProposalsHubCTBalance).to.equal(1000);
    await solver.connect(this.keeper).proposePayouts([0,1]); // Failure.
    await solver.connect(this.keeper).confirmPayouts();


    await this.ProposalsHub.connect(this.user0).reclaimTokens(proposalId, positionIdFailure);

    const user0CTBalance = await this.CT.balanceOf(this.user0.address, positionIdFailure);
    expect(user0CTBalance).to.equal(this.amount);

    await this.CT.connect(this.user0).redeemPositions(this.ToyToken.address, ethers.constants.HashZero, conditionId, [indexSetFailure]);
    const user0ToyBalance = await this.ToyToken.balanceOf(this.user0.address);
    expect(user0ToyBalance).to.equal(1000);
  });
});

