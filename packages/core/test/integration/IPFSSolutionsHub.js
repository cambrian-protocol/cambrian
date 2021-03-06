const { ethers, deployments } = require("hardhat");
const { expect } = require("chai");
const SOLVER_ABI =
  require("../../artifacts/contracts/solvers/Solver.sol/Solver.json").abi;
const { FormatTypes } = require("ethers/lib/utils");

const {
  getMultihashFromBytes32,
  getBytes32FromMultihash,
} = require("../../helpers/multihash.js");
const Hash = require("ipfs-only-hash");

describe("IPFSSolutionsHub", function () {
  this.beforeEach(async function () {
    const [buyer, seller, keeper, arbitrator] = await ethers.getSigners();
    this.buyer = buyer;
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
    this.IPFSSolutionsHub = await ethers.getContract("IPFSSolutionsHub");
    this.ProposalsHub = await ethers.getContract("ProposalsHub");
    this.ToyToken = await ethers.getContract("ToyToken");
    this.Solver = await ethers.getContract("BasicSolverV1");

    this.ISolver = new ethers.utils.Interface(SOLVER_ABI);
    this.ISolver.format(FormatTypes.full);

    await this.ToyToken.mint(this.buyer.address, this.amount);
  });

  it("Should create, fund and execute proposal tied to hash of solver configs", async function () {
    //Create solution
    const solutionBaseId = ethers.utils.formatBytes32String("TestID");

    const ingests = [
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
          [this.buyer.address]
        ),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: ethers.utils.formatBytes32String("2"),
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(
          ["address"],
          [this.seller.address]
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

    const conditionBase = {
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
        "QmYZB6LDtGqqfJyhJDEp7rgFgEVSm7H7yyXZjhvCqVkYvZ",
        "QmPrcQH4akfr7eSn4tQHmmudLdJpKhHskVJ5iqYxCks1FP",
      ],
    };

    const solverConfigs = [
      [
        this.Solver.address,
        this.keeper.address,
        this.arbitrator.address,
        0,
        [],
        ingests,
        conditionBase,
      ],
    ];

    const cid = await Hash.of(solverConfigs);
    const nullCid = await Hash.of(JSON.stringify({}));

    await this.IPFSSolutionsHub.connect(this.keeper).createBase(
      solutionBaseId,
      this.ToyToken.address,
      solverConfigs,
      cid
    );

    let tx = await this.ProposalsHub.connect(this.keeper).createProposal(
      this.ToyToken.address,
      this.IPFSSolutionsHub.address,
      this.amount,
      ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["bytes32", "uint256"],
          [solutionBaseId, 1]
        )
      ),
      solverConfigs,
      nullCid
    );
    let rc = await tx.wait();
    const proposalId = new ethers.utils.Interface([
      "event CreateProposal(bytes32 indexed id)",
    ]).parseLog(rc.logs[1]).args.id;

    const solutionId = new ethers.utils.Interface([
      "event CreateSolution(bytes32 id)",
    ]).parseLog(rc.logs[0]).args.id;

    //Fund Proposal
    await this.ToyToken.connect(this.buyer).approve(
      this.ProposalsHub.address,
      this.amount
    );
    await this.ProposalsHub.connect(this.buyer).fundProposal(
      proposalId,
      this.ToyToken.address,
      this.amount
    );

    await this.ProposalsHub.connect(this.keeper).executeIPFSProposal(
      proposalId,
      solverConfigs
    );

    const solution = await this.IPFSSolutionsHub.getSolution(solutionId);

    console.log(solution);

    expect(solution.executed).to.equal(true);
    expect(solution.solverConfigsURI).to.equal(cid);

    const solverAddress = await this.IPFSSolutionsHub.solverFromIndex(
      solutionId,
      0
    );

    const solver = new ethers.Contract(
      solverAddress,
      SOLVER_ABI,
      ethers.provider
    );

    await solver.connect(this.keeper).proposePayouts(0, [1, 0]);
    await solver.connect(this.keeper).confirmPayouts(0);

    const condition = await solver.conditions(0);
    await this.CT.connect(this.seller).redeemPositions(
      this.ToyToken.address,
      ethers.constants.HashZero,
      condition.conditionId,
      [1, 2]
    );
    const sellerERC20Balance = await this.ToyToken.balanceOf(
      this.seller.address
    );
    expect(sellerERC20Balance).to.equal(this.amount);
  });
});
