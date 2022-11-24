const { ethers, deployments } = require("hardhat");
const { expect } = require("chai");
const SOLVER_ABI =
  require("../../artifacts/contracts/solvers/Solver.sol/Solver.json").abi;
const IPFSSOLUTIONSHUB_ABI =
  require("../../artifacts/contracts/hubs/IPFSSolutionsHub.sol/IPFSSolutionsHub.json").abi;
const { FormatTypes } = require("ethers/lib/utils");
const {
  getIndexSetFromBinaryArray,
} = require("../../helpers/ConditionalTokens.js");
const {
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");

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

    await deployments.fixture(["test"]);

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
          [this.user0.address]
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
      {
        executions: 0,
        ingestType: 1,
        slot: ethers.utils.formatBytes32String("5"),
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], [1000]),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: ethers.utils.formatBytes32String("6"),
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], [9000]),
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
            ethers.utils.formatBytes32String("5"),
            ethers.utils.formatBytes32String("6"),
          ],
        },
        {
          recipientAddressSlot: ethers.utils.formatBytes32String("2"),
          recipientAmountSlots: [
            ethers.utils.formatBytes32String("6"),
            ethers.utils.formatBytes32String("5"),
          ],
        },
      ],
      outcomeURIs: [
        "QmYZB6LDtGqqfJyhJDEp7rgFgEVSm7H7yyXZjhvCqVkYvZ",
        "QmPrcQH4akfr7eSn4tQHmmudLdJpKhHskVJ5iqYxCks1FP",
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

  it("Math rounding bug", async function () {
    let tx = await this.ProposalsHub.connect(
      this.keeper
    ).createIPFSSolutionAndProposal(
      this.solutionBaseId,
      this.ToyToken.address,
      this.IPFSSolutionsHub.address,
      this.amount,
      this.solverConfigs,
      this.cid,
      this.emptyCid
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
      900
    );
    await this.ProposalsHub.connect(this.user0).fundProposal(
      proposalId,
      this.ToyToken.address,
      900
    );
    await this.ToyToken.connect(this.user1).approve(
      this.ProposalsHub.address,
      100
    );
    await this.ProposalsHub.connect(this.user1).fundProposal(
      proposalId,
      this.ToyToken.address,
      100
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
    expect(ProposalsHubCTBalance).to.equal(900);

    await this.ProposalsHub.connect(this.user0).reclaimTokens(
      proposalId,
      positionIdFailure
    );

    // expect(user0CTBalance2).to.equal(900);

    await this.ProposalsHub.connect(this.user1).reclaimTokens(
      proposalId,
      positionIdFailure
    );

    const user1CTBalance2 = await this.CT.balanceOf(
      this.user1.address,
      positionIdFailure
    );
    expect(user1CTBalance2).to.equal(90);
    await expectRevert(
      this.ProposalsHub.connect(this.user1).reclaimTokens(
        proposalId,
        positionIdFailure
      ),
      "ProposalsHub::Claim is 0"
    );
  });
});
