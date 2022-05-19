const { ethers, deployments } = require("hardhat");
const { expect } = require("chai");
const SOLVER_ABI =
  require("../../artifacts/contracts/solvers/Solver.sol/Solver.json").abi;
const IPFSSOLUTIONSHUB_ABI =
  require("../../artifacts/contracts/IPFSSolutionsHub.sol/IPFSSolutionsHub.json").abi;
const { FormatTypes } = require("ethers/lib/utils");
const {
  getIndexSetFromBinaryArray,
} = require("../../helpers/ConditionalTokens.js");
const {
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");

const { getBytes32FromMultihash } = require("../../helpers/multihash");
const Hash = require("ipfs-only-hash");

describe("ProposalsHub", function () {
  this.beforeEach(async function () {
    const [user0, user1, seller, keeper, arbitrator] =
      await ethers.getSigners();
    this.user0 = user0;
    this.user1 = user1;
    this.seller = seller;
    this.keeper = keeper;
    this.arbitrator = arbitrator;
    this.amount = 1000;

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
    this.ProposalsHub = await ethers.getContract("ProposalsHub");
    this.ToyToken = await ethers.getContract("ToyToken");
    this.Solver = await ethers.getContract("BasicSolverV1");
    this.IPFSSolutionsHub = await ethers.getContract("IPFSSolutionsHub");

    this.ISolver = new ethers.utils.Interface(SOLVER_ABI);
    this.ISolver.format(FormatTypes.full);

    this.IIPFSSolutionsHub = new ethers.utils.Interface(IPFSSOLUTIONSHUB_ABI);
    this.IIPFSSolutionsHub.format(FormatTypes.full);

    await this.ToyToken.mint(this.user0.address, this.amount);
    await this.ToyToken.mint(this.user1.address, this.amount);

    //Create solution
    this.solutionBaseId = ethers.utils.formatBytes32String("TestID");
    this.ingests = [
      {
        executions: 0,
        ingestType: 1,
        slot: ethers.utils.formatBytes32String("0"),
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(
          ["bytes32"],
          [ethers.utils.formatBytes32String("")]
        ),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: ethers.utils.formatBytes32String("1"),
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(
          ["address"],
          [this.ProposalsHub.address]
        ),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: ethers.utils.formatBytes32String("2"),
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(
          ["address"],
          [this.ProposalsHub.address]
        ),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: ethers.utils.formatBytes32String("3"),
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], [0]),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: ethers.utils.formatBytes32String("4"),
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], [10000]),
      },
    ];

    this.conditionBase = {
      collateralToken: this.ToyToken.address,
      outcomeSlots: 2,
      parentCollectionIndexSet: 0,
      amountSlot: ethers.utils.formatBytes32String("4"),
      partition: [1, 2],
      allocations: [
        {
          recipientAddressSlot: ethers.utils.formatBytes32String("1"),
          recipientAmountSlots: [
            ethers.utils.formatBytes32String("3"),
            ethers.utils.formatBytes32String("4"),
          ],
        },
        {
          recipientAddressSlot: ethers.utils.formatBytes32String("2"),
          recipientAmountSlots: [
            ethers.utils.formatBytes32String("4"),
            ethers.utils.formatBytes32String("3"),
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

    this.solverConfigs = [
      [
        this.Solver.address,
        this.keeper.address,
        this.arbitrator.address,
        0,
        [],
        this.ingests,
        this.conditionBase,
      ],
    ];

    this.cid = await Hash.of(JSON.stringify(this.solverConfigs));
    this.emptyCid = await Hash.of(JSON.stringify({}));
  });

  it("Should fund a proposal", async function () {
    //Create proposal
    let tx2 = await this.ProposalsHub.connect(
      this.keeper
    ).createIPFSSolutionAndProposal(
      this.solutionBaseId,
      this.ToyToken.address,
      this.IPFSSolutionsHub.address,
      this.amount,
      this.solverConfigs,
      getBytes32FromMultihash(this.cid),
      getBytes32FromMultihash(this.emptyCid)
    );
    let receipt2 = await tx2.wait();
    let iface2 = new ethers.utils.Interface([
      "event CreateProposal(bytes32 indexed id)",
    ]);
    const proposalId = iface2.parseLog(receipt2.logs[2]).args.id;

    //Fund Proposal
    await this.ToyToken.connect(this.user0).approve(
      this.ProposalsHub.address,
      this.amount / 2
    );
    await this.ProposalsHub.connect(this.user0).fundProposal(
      proposalId,
      this.ToyToken.address,
      this.amount / 2
    );

    let user0funding = await this.ProposalsHub.funderAmountMap(
      proposalId,
      this.user0.address
    );
    expect(user0funding).to.equal(this.amount / 2);

    await this.ToyToken.connect(this.user1).approve(
      this.ProposalsHub.address,
      this.amount / 2
    );
    await this.ProposalsHub.connect(this.user1).fundProposal(
      proposalId,
      this.ToyToken.address,
      this.amount / 2
    );
    let user1funding = await this.ProposalsHub.funderAmountMap(
      proposalId,
      this.user1.address
    );
    expect(user1funding).to.equal(this.amount / 2);

    let proposal = await this.ProposalsHub.proposals(proposalId);
    expect(proposal.funding).to.equal(this.amount);

    let proposalHubBalance = await this.ToyToken.balanceOf(
      this.ProposalsHub.address
    );
    expect(proposalHubBalance).to.equal(this.amount);
  });

  it("Should fund and defund a proposal", async function () {
    //Create proposal
    let tx2 = await this.ProposalsHub.connect(
      this.keeper
    ).createIPFSSolutionAndProposal(
      this.solutionBaseId,
      this.ToyToken.address,
      this.IPFSSolutionsHub.address,
      this.amount,
      this.solverConfigs,
      getBytes32FromMultihash(this.cid),
      getBytes32FromMultihash(this.emptyCid)
    );
    let receipt2 = await tx2.wait();
    let iface2 = new ethers.utils.Interface([
      "event CreateProposal(bytes32 indexed id)",
    ]);
    const proposalId = iface2.parseLog(receipt2.logs[2]).args.id;

    //Fund Proposal
    await this.ToyToken.connect(this.user0).approve(
      this.ProposalsHub.address,
      this.amount / 2
    );
    await this.ProposalsHub.connect(this.user0).fundProposal(
      proposalId,
      this.ToyToken.address,
      this.amount / 2
    );

    let user0funding = await this.ProposalsHub.funderAmountMap(
      proposalId,
      this.user0.address
    );
    expect(user0funding).to.equal(this.amount / 2);

    await this.ToyToken.connect(this.user1).approve(
      this.ProposalsHub.address,
      this.amount / 2
    );
    await this.ProposalsHub.connect(this.user1).fundProposal(
      proposalId,
      this.ToyToken.address,
      this.amount / 2
    );

    await this.ProposalsHub.connect(this.user1).defundProposal(
      proposalId,
      this.ToyToken.address,
      this.amount / 2
    );

    let proposalHubBalance = await this.ToyToken.balanceOf(
      this.ProposalsHub.address
    );
    expect(proposalHubBalance).to.equal(this.amount / 2);

    let proposal = await this.ProposalsHub.proposals(proposalId);
    expect(proposal.funding).to.equal(this.amount / 2);

    user1funding = await this.ProposalsHub.funderAmountMap(
      proposalId,
      this.user1.address
    );
    expect(user1funding).to.equal(0);
  });

  it("reverts when executing if funding is not met", async function () {
    //Create proposal
    let tx2 = await this.ProposalsHub.connect(
      this.keeper
    ).createIPFSSolutionAndProposal(
      this.solutionBaseId,
      this.ToyToken.address,
      this.IPFSSolutionsHub.address,
      this.amount,
      this.solverConfigs,
      getBytes32FromMultihash(this.cid),
      getBytes32FromMultihash(this.emptyCid)
    );
    let receipt2 = await tx2.wait();
    let iface2 = new ethers.utils.Interface([
      "event CreateProposal(bytes32 indexed id)",
    ]);
    const proposalId = iface2.parseLog(receipt2.logs[2]).args.id;

    //Fund Proposal
    await this.ToyToken.connect(this.user0).approve(
      this.ProposalsHub.address,
      this.amount / 2
    );
    await this.ProposalsHub.connect(this.user0).fundProposal(
      proposalId,
      this.ToyToken.address,
      this.amount / 2
    );

    await expectRevert(
      this.ProposalsHub.executeIPFSProposal(proposalId, this.solverConfigs),
      "Proposal not fully funded"
    );
  });

  it("can receive conditional tokens from a Solver", async function () {
    //Create proposal
    let tx = await this.ProposalsHub.connect(
      this.keeper
    ).createIPFSSolutionAndProposal(
      this.solutionBaseId,
      this.ToyToken.address,
      this.IPFSSolutionsHub.address,
      this.amount,
      this.solverConfigs,
      getBytes32FromMultihash(this.cid),
      getBytes32FromMultihash(this.emptyCid)
    );
    let receipt = await tx.wait();
    let iface = new ethers.utils.Interface([
      "event CreateProposal(bytes32 indexed id)",
    ]);
    const proposalId = iface.parseLog(receipt.logs[2]).args.id;

    let iface2 = new ethers.utils.Interface([
      "event CreateSolution(bytes32 id)",
    ]);
    const solutionId = iface2.parseLog(receipt.logs[1]).args.id;

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

    await this.ProposalsHub.executeIPFSProposal(proposalId, this.solverConfigs);

    const solverAddress = await this.IPFSSolutionsHub.solverFromIndex(
      solutionId,
      0
    );

    let solver = new ethers.Contract(
      solverAddress,
      SOLVER_ABI,
      ethers.provider
    );

    await solver.connect(this.keeper).executeSolve(0);
    const conditions = await solver.getConditions();
    const condition = await conditions[conditions.length - 1];
    const conditionId = condition["conditionId"];

    const indexSetFailure = getIndexSetFromBinaryArray([0, 1]); // If failure
    const collectionIdFailure = await this.CT.getCollectionId(
      ethers.constants.HashZero,
      conditionId,
      indexSetFailure
    );
    const positionIdFailure = await this.CT.getPositionId(
      this.ToyToken.address,
      collectionIdFailure
    );

    let ProposalsHubCTBalance = await this.CT.balanceOf(
      this.ProposalsHub.address,
      positionIdFailure
    );
    expect(ProposalsHubCTBalance).to.equal(1000);
  });

  it("conditional tokens can be reclaimed from the Proposal", async function () {
    let tx = await this.ProposalsHub.connect(
      this.keeper
    ).createIPFSSolutionAndProposal(
      this.solutionBaseId,
      this.ToyToken.address,
      this.IPFSSolutionsHub.address,
      this.amount,
      this.solverConfigs,
      getBytes32FromMultihash(this.cid),
      getBytes32FromMultihash(this.emptyCid)
    );
    let receipt = await tx.wait();
    let iface = new ethers.utils.Interface([
      "event CreateProposal(bytes32 indexed id)",
    ]);
    const proposalId = iface.parseLog(receipt.logs[2]).args.id;

    let iface2 = new ethers.utils.Interface([
      "event CreateSolution(bytes32 id)",
    ]);
    const solutionId = iface2.parseLog(receipt.logs[1]).args.id;

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

    await this.ProposalsHub.executeIPFSProposal(proposalId, this.solverConfigs);

    const solverAddress = await this.IPFSSolutionsHub.solverFromIndex(
      solutionId,
      0
    );
    let solver = new ethers.Contract(
      solverAddress,
      SOLVER_ABI,
      ethers.provider
    );

    await solver.connect(this.keeper).executeSolve(0);

    const conditions = await solver.getConditions();
    const condition = await conditions[conditions.length - 1];
    const conditionId = condition["conditionId"];

    const indexSetFailure = getIndexSetFromBinaryArray([0, 1]); // If failure
    const collectionIdFailure = await this.CT.getCollectionId(
      ethers.constants.HashZero,
      conditionId,
      indexSetFailure
    );
    const positionIdFailure = await this.CT.getPositionId(
      this.ToyToken.address,
      collectionIdFailure
    );

    let ProposalsHubCTBalance = await this.CT.balanceOf(
      this.ProposalsHub.address,
      positionIdFailure
    );
    expect(ProposalsHubCTBalance).to.equal(1000);
    await solver.connect(this.keeper).proposePayouts(0, [0, 1]); // Failure.
    await solver.connect(this.keeper).confirmPayouts(0);

    await this.ProposalsHub.connect(this.user0).reclaimTokens(
      proposalId,
      positionIdFailure
    );

    const user0CTBalance = await this.CT.balanceOf(
      this.user0.address,
      positionIdFailure
    );
    expect(user0CTBalance).to.equal(this.amount);

    await this.CT.connect(this.user0).redeemPositions(
      this.ToyToken.address,
      ethers.constants.HashZero,
      conditionId,
      [indexSetFailure]
    );
    const user0ToyBalance = await this.ToyToken.balanceOf(this.user0.address);
    expect(user0ToyBalance).to.equal(1000);
  });

  it("Multiple users can reclaim CTs from Proposal", async function () {
    let tx = await this.ProposalsHub.connect(
      this.keeper
    ).createIPFSSolutionAndProposal(
      this.solutionBaseId,
      this.ToyToken.address,
      this.IPFSSolutionsHub.address,
      this.amount,
      this.solverConfigs,
      getBytes32FromMultihash(this.cid),
      getBytes32FromMultihash(this.emptyCid)
    );
    let receipt = await tx.wait();
    let iface = new ethers.utils.Interface([
      "event CreateProposal(bytes32 indexed id)",
    ]);
    const proposalId = iface.parseLog(receipt.logs[2]).args.id;

    let iface2 = new ethers.utils.Interface([
      "event CreateSolution(bytes32 id)",
    ]);
    const solutionId = iface2.parseLog(receipt.logs[1]).args.id;

    //Fund Proposal
    await this.ToyToken.connect(this.user0).approve(
      this.ProposalsHub.address,
      this.amount / 2
    );
    await this.ProposalsHub.connect(this.user0).fundProposal(
      proposalId,
      this.ToyToken.address,
      this.amount / 2
    );
    await this.ToyToken.connect(this.user1).approve(
      this.ProposalsHub.address,
      this.amount / 2
    );
    await this.ProposalsHub.connect(this.user1).fundProposal(
      proposalId,
      this.ToyToken.address,
      this.amount / 2
    );

    await this.ProposalsHub.executeIPFSProposal(proposalId, this.solverConfigs);

    const solverAddress = await this.IPFSSolutionsHub.solverFromIndex(
      solutionId,
      0
    );
    let solver = new ethers.Contract(
      solverAddress,
      SOLVER_ABI,
      ethers.provider
    );

    await solver.connect(this.keeper).executeSolve(0);

    const conditions = await solver.getConditions();
    const condition = await conditions[conditions.length - 1];
    const conditionId = condition["conditionId"];

    const indexSetFailure = getIndexSetFromBinaryArray([0, 1]); // If failure
    const collectionIdFailure = await this.CT.getCollectionId(
      ethers.constants.HashZero,
      conditionId,
      indexSetFailure
    );
    const positionIdFailure = await this.CT.getPositionId(
      this.ToyToken.address,
      collectionIdFailure
    );

    let ProposalsHubCTBalance = await this.CT.balanceOf(
      this.ProposalsHub.address,
      positionIdFailure
    );
    expect(ProposalsHubCTBalance).to.equal(1000);
    await solver.connect(this.keeper).proposePayouts(0, [0, 1]); // Failure.
    await solver.connect(this.keeper).confirmPayouts(0);

    await this.ProposalsHub.connect(this.user0).reclaimTokens(
      proposalId,
      positionIdFailure
    );
    await this.ProposalsHub.connect(this.user1).reclaimTokens(
      proposalId,
      positionIdFailure
    );

    const user0CTBalance = await this.CT.balanceOf(
      this.user0.address,
      positionIdFailure
    );
    expect(user0CTBalance).to.equal(this.amount / 2);
    await this.CT.connect(this.user0).redeemPositions(
      this.ToyToken.address,
      ethers.constants.HashZero,
      conditionId,
      [indexSetFailure]
    );
    const user0ToyBalance = await this.ToyToken.balanceOf(this.user0.address);
    expect(user0ToyBalance).to.equal(1000);

    const user1CTBalance = await this.CT.balanceOf(
      this.user1.address,
      positionIdFailure
    );
    expect(user1CTBalance).to.equal(this.amount / 2);
    await this.CT.connect(this.user1).redeemPositions(
      this.ToyToken.address,
      ethers.constants.HashZero,
      conditionId,
      [indexSetFailure]
    );
    const user1ToyBalance = await this.ToyToken.balanceOf(this.user1.address);
    expect(user1ToyBalance).to.equal(1000);
  });

  it("Does not allow funding while active", async function () {
    //Create proposal
    let tx2 = await this.ProposalsHub.connect(
      this.keeper
    ).createIPFSSolutionAndProposal(
      this.solutionBaseId,
      this.ToyToken.address,
      this.IPFSSolutionsHub.address,
      this.amount,
      this.solverConfigs,
      getBytes32FromMultihash(this.cid),
      getBytes32FromMultihash(this.emptyCid)
    );
    let receipt2 = await tx2.wait();
    let iface2 = new ethers.utils.Interface([
      "event CreateProposal(bytes32 indexed id)",
    ]);
    const proposalId = iface2.parseLog(receipt2.logs[2]).args.id;

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

    await this.ProposalsHub.executeIPFSProposal(proposalId, this.solverConfigs);

    await this.ToyToken.mint(this.user0.address, 1000);
    await expectRevert(
      this.ProposalsHub.connect(this.user0).fundProposal(
        proposalId,
        this.ToyToken.address,
        this.amount
      ),
      "ProposalsHub::Proposal already executed"
    );
  });

  it("Does not allow defunding while active", async function () {
    //Create proposal
    let tx2 = await this.ProposalsHub.connect(
      this.keeper
    ).createIPFSSolutionAndProposal(
      this.solutionBaseId,
      this.ToyToken.address,
      this.IPFSSolutionsHub.address,
      this.amount,
      this.solverConfigs,
      getBytes32FromMultihash(this.cid),
      getBytes32FromMultihash(this.emptyCid)
    );
    let receipt2 = await tx2.wait();
    let iface2 = new ethers.utils.Interface([
      "event CreateProposal(bytes32 indexed id)",
    ]);
    const proposalId = iface2.parseLog(receipt2.logs[2]).args.id;

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

    await this.ProposalsHub.executeIPFSProposal(proposalId, this.solverConfigs);

    // Give Hub extra tokens otherwise defund will revert for not enough funds
    await this.ToyToken.mint(this.ProposalsHub.address, 1000);
    await expectRevert(
      this.ProposalsHub.connect(this.user0).defundProposal(
        proposalId,
        this.ToyToken.address,
        this.amount
      ),
      "ProposalsHub::Proposal already executed"
    );
  });

  it("Allows reclaiming multiple tokens", async function () {
    let tx = await this.ProposalsHub.connect(
      this.keeper
    ).createIPFSSolutionAndProposal(
      this.solutionBaseId,
      this.ToyToken.address,
      this.IPFSSolutionsHub.address,
      this.amount,
      this.solverConfigs,
      getBytes32FromMultihash(this.cid),
      getBytes32FromMultihash(this.emptyCid)
    );
    let receipt = await tx.wait();
    let iface = new ethers.utils.Interface([
      "event CreateProposal(bytes32 indexed id)",
    ]);
    const proposalId = iface.parseLog(receipt.logs[2]).args.id;

    let iface2 = new ethers.utils.Interface([
      "event CreateSolution(bytes32 id)",
    ]);
    const solutionId = iface2.parseLog(receipt.logs[1]).args.id;

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

    await this.ProposalsHub.executeIPFSProposal(proposalId, this.solverConfigs);

    const solverAddress = await this.IPFSSolutionsHub.solverFromIndex(
      solutionId,
      0
    );
    let solver = new ethers.Contract(
      solverAddress,
      SOLVER_ABI,
      ethers.provider
    );

    await solver.connect(this.keeper).executeSolve(0);

    const conditions = await solver.getConditions();
    const condition = await conditions[conditions.length - 1];
    const conditionId = condition["conditionId"];

    const indexSetFailure = getIndexSetFromBinaryArray([0, 1]); // If failure
    const indexSetSuccess = getIndexSetFromBinaryArray([1, 0]); // If Success

    const collectionIdFailure = await this.CT.getCollectionId(
      ethers.constants.HashZero,
      conditionId,
      indexSetFailure
    );
    const collectionIdSuccess = await this.CT.getCollectionId(
      ethers.constants.HashZero,
      conditionId,
      indexSetSuccess
    );
    const positionIdFailure = await this.CT.getPositionId(
      this.ToyToken.address,
      collectionIdFailure
    );
    const positionIdSuccess = await this.CT.getPositionId(
      this.ToyToken.address,
      collectionIdSuccess
    );

    let ProposalsHubCTBalanceFailure = await this.CT.balanceOf(
      this.ProposalsHub.address,
      positionIdFailure
    );
    let ProposalsHubCTBalanceSuccess = await this.CT.balanceOf(
      this.ProposalsHub.address,
      positionIdSuccess
    );
    expect(ProposalsHubCTBalanceFailure).to.equal(1000);
    expect(ProposalsHubCTBalanceSuccess).to.equal(1000);

    await this.ProposalsHub.connect(this.user0).reclaimTokens(
      proposalId,
      positionIdFailure
    );
    await this.ProposalsHub.connect(this.user0).reclaimTokens(
      proposalId,
      positionIdSuccess
    );

    const user0CTBalanceFailure = await this.CT.balanceOf(
      this.user0.address,
      positionIdFailure
    );
    const user0CTBalanceSuccess = await this.CT.balanceOf(
      this.user0.address,
      positionIdSuccess
    );
    expect(user0CTBalanceFailure).to.equal(this.amount);
    expect(user0CTBalanceSuccess).to.equal(this.amount);
  });

  it("Does not allow reclaiming too many tokens", async function () {
    let tx = await this.ProposalsHub.connect(
      this.keeper
    ).createIPFSSolutionAndProposal(
      this.solutionBaseId,
      this.ToyToken.address,
      this.IPFSSolutionsHub.address,
      this.amount,
      this.solverConfigs,
      getBytes32FromMultihash(this.cid),
      getBytes32FromMultihash(this.emptyCid)
    );
    let receipt = await tx.wait();
    let iface = new ethers.utils.Interface([
      "event CreateProposal(bytes32 indexed id)",
    ]);
    const proposalId = iface.parseLog(receipt.logs[2]).args.id;

    let iface2 = new ethers.utils.Interface([
      "event CreateSolution(bytes32 id)",
    ]);
    const solutionId = iface2.parseLog(receipt.logs[1]).args.id;

    //Fund Proposal
    await this.ToyToken.connect(this.user0).approve(
      this.ProposalsHub.address,
      this.amount / 2
    );
    await this.ProposalsHub.connect(this.user0).fundProposal(
      proposalId,
      this.ToyToken.address,
      this.amount / 2
    );
    await this.ToyToken.connect(this.user1).approve(
      this.ProposalsHub.address,
      this.amount / 2
    );
    await this.ProposalsHub.connect(this.user1).fundProposal(
      proposalId,
      this.ToyToken.address,
      this.amount / 2
    );

    await this.ProposalsHub.executeIPFSProposal(proposalId, this.solverConfigs);

    const solverAddress = await this.IPFSSolutionsHub.solverFromIndex(
      solutionId,
      0
    );
    let solver = new ethers.Contract(
      solverAddress,
      SOLVER_ABI,
      ethers.provider
    );

    await solver.connect(this.keeper).executeSolve(0);

    const conditions = await solver.getConditions();
    const condition = await conditions[conditions.length - 1];
    const conditionId = condition["conditionId"];

    const indexSetFailure = getIndexSetFromBinaryArray([0, 1]); // If failure
    const collectionIdFailure = await this.CT.getCollectionId(
      ethers.constants.HashZero,
      conditionId,
      indexSetFailure
    );
    const positionIdFailure = await this.CT.getPositionId(
      this.ToyToken.address,
      collectionIdFailure
    );

    let ProposalsHubCTBalance = await this.CT.balanceOf(
      this.ProposalsHub.address,
      positionIdFailure
    );
    expect(ProposalsHubCTBalance).to.equal(1000);

    await this.ProposalsHub.connect(this.user0).reclaimTokens(
      proposalId,
      positionIdFailure
    );
    await this.ProposalsHub.connect(this.user1).reclaimTokens(
      proposalId,
      positionIdFailure
    );

    await this.CT.connect(this.user0).safeTransferFrom(
      this.user0.address,
      this.ProposalsHub.address,
      positionIdFailure,
      this.amount / 2,
      ethers.utils.defaultAbiCoder.encode(["bytes32"], [proposalId])
    );

    await this.ProposalsHub.connect(this.user0).reclaimTokens(
      proposalId,
      positionIdFailure
    );
    const user0CTBalance2 = await this.CT.balanceOf(
      this.user0.address,
      positionIdFailure
    );
    expect(user0CTBalance2).to.equal(this.amount / 2 / 2);
    await expectRevert(
      this.ProposalsHub.connect(this.user0).reclaimTokens(
        proposalId,
        positionIdFailure
      ),
      "ProposalsHub::Claim is 0"
    );

    await this.ProposalsHub.connect(this.user1).reclaimTokens(
      proposalId,
      positionIdFailure
    );
    const user1CTBalance2 = await this.CT.balanceOf(
      this.user1.address,
      positionIdFailure
    );
    expect(user1CTBalance2).to.equal(this.amount / 2 + this.amount / 2 / 2);
    await expectRevert(
      this.ProposalsHub.connect(this.user1).reclaimTokens(
        proposalId,
        positionIdFailure
      ),
      "ProposalsHub::Claim is 0"
    );
  });

  it("Can create Solution and Proposal in same tx with createIPFSSolutionAndProposal", async function () {
    //Create proposal
    let tx = await this.ProposalsHub.connect(
      this.keeper
    ).createIPFSSolutionAndProposal(
      this.solutionBaseId,
      this.ToyToken.address,
      this.IPFSSolutionsHub.address,
      this.amount,
      this.solverConfigs,
      getBytes32FromMultihash(this.cid),
      getBytes32FromMultihash(this.emptyCid)
    );

    const res = await tx.wait();

    const solutionId = new ethers.utils.Interface([
      "event CreateSolution(bytes32 id)",
    ]).parseLog(res.logs[1]).args.id;

    const solution = await this.IPFSSolutionsHub.getSolution(solutionId);

    expect(solution.id).to.not.equal(ethers.constants.HashZero);
    expect(solution.id).to.equal(solutionId);
  });
});
