const { ethers } = require("hardhat");
const { expect } = require("chai");
const SOLVER_ABI = require("../artifacts/contracts/Solver.sol/Solver.json").abi;
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

    const actions = [
      [
        ethers.constants.AddressZero, // to address
        false, // bool executed
        true, // useSolverIdx
        0, // solverIdx
        0, // value
        this.ISolver.encodeFunctionData("executeCanonCondition", [
          2,
          ethers.utils.formatBytes32String(""),
          100,
          [2, 1],
          [
            [this.seller.address, this.buyer.address],
            [this.seller.address, this.buyer.address],
          ],
          [
            [0, 100],
            [100, 0],
          ],
          "test metadata"
        ]),
      ]
    ];

    this.solverConfigs = [
      [
        this.SolverFactory.address,
        this.keeper.address,
        this.arbiter.address,
        0,
        ethers.utils.formatBytes32String(""),
        actions,
      ],
    ];
  });

  // it("Should create a Solution", async function () {
  //   let tx = await this.SolutionsHub.connect(this.keeper).createSolution(
  //     this.solverConfigs
  //   );
  //   let receipt = await tx.wait();
  //   let iface = new ethers.utils.Interface([
  //     "event CreateSolution(bytes32 id)",
  //   ]);
  //   const solutionId = iface.parseLog(receipt.logs[0]).args.id;
  //   const solution = await this.SolutionsHub.getSolution(solutionId);
  //   expect(solutionId).to.equal(
  //     "0x320723cfc0bfa9b0f7c5b275a01ffa5e0f111f05723ba5df2b2684ab86bebe06"
  //   );
  //   expect(solution.id).to.equal(
  //     "0x320723cfc0bfa9b0f7c5b275a01ffa5e0f111f05723ba5df2b2684ab86bebe06"
  //   );
  // });

  // it("Should create a Proposal", async function () {
  //   //Create solution
  //   let tx = await this.SolutionsHub.connect(this.keeper).createSolution(
  //     this.solverConfigs
  //   );
  //   let receipt = await tx.wait();
  //   let iface = new ethers.utils.Interface([
  //     "event CreateSolution(bytes32 id)",
  //   ]);
  //   const solutionId = iface.parseLog(receipt.logs[0]).args.id;
  //   const solution = await this.SolutionsHub.getSolution(solutionId);

  //   //Create proposal
  //   let tx2 = await this.ProposalsHub.connect(this.keeper).createProposal(
  //     this.ToyToken.address,
  //     this.SolutionsHub.address,
  //     100,
  //     solutionId
  //   );
  //   let receipt2 = await tx2.wait();
  //   let iface2 = new ethers.utils.Interface([
  //     "event CreateProposal(bytes32 id)",
  //   ]);
  //   const proposalId = iface2.parseLog(receipt2.logs[0]).args.id;
  //   const proposal = await this.ProposalsHub.getProposal(proposalId);
  //   expect(proposalId).to.equal(
  //     "0xa06e7b028084ed6c8694d0574cfc7943c8d93ce3ce4a0a0d3834907dd8a4971d"
  //   );
  //   expect(proposal.id).to.equal(
  //     "0xa06e7b028084ed6c8694d0574cfc7943c8d93ce3ce4a0a0d3834907dd8a4971d"
  //   );
  // });

  it("Should execute single-solver Proposal", async function () {
    //Create solution
    let tx = await this.SolutionsHub.connect(this.keeper).createSolution(
      this.ToyToken.address,
      this.solverConfigs
    );
    let receipt = await tx.wait();
    let iface = new ethers.utils.Interface([
      "event CreateSolution(bytes32 id)",
    ]);
    const solutionId = iface.parseLog(receipt.logs[0]).args.id;

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
    const collectionIdSuccess = await this.CT.getCollectionId(ethers.constants.HashZero, conditionId, indexSetSuccess)
    const positionIdSuccess = await this.CT.getPositionId(this.ToyToken.address, collectionIdSuccess)
    const buyerSuccessBalance = await this.CT.balanceOf(this.buyer.address, positionIdSuccess)
    const sellerSuccessBalance = await this.CT.balanceOf(this.seller.address, positionIdSuccess)
    expect(buyerSuccessBalance).to.equal(0)
    expect(sellerSuccessBalance).to.equal(100)


    // Buyer should have all the failure tokens
    const indexSetFailure = getIndexSetFromBinaryArray([0,1]) // If failure
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



  // it("Should execute multi-solver Proposal", async function () {
  //   const actions = [
  //     [
  //       ethers.constants.AddressZero, // to address
  //       false, // bool executed
  //       true, // useSolverIdx
  //       0, // solverIdx
  //       0, // value
  //       this.ISolver.encodeFunctionData("executeCanonCondition", [
  //         2,
  //         ethers.utils.formatBytes32String(""),
  //         100,
  //         [2, 1],
  //         [
  //           [this.seller.address, this.buyer.address],
  //           [this.seller.address, this.buyer.address],
  //         ],
  //         [
  //           [0, 100],
  //           [100, 0],
  //         ],
  //         "test metadata"
  //       ]),
  //     ]
  //   ];

  //   this.solverConfigs = [
  //     [
  //       this.SolverFactory.address,
  //       this.keeper.address,
  //       this.arbiter.address,
  //       0,
  //       ethers.utils.formatBytes32String(""),
  //       actions,
  //     ],
  //   ];


  //   //Create solution
  //   let tx = await this.SolutionsHub.connect(this.keeper).createSolution(
  //     this.ToyToken.address,
  //     this.solverConfigs
  //   );
  //   let receipt = await tx.wait();
  //   let iface = new ethers.utils.Interface([
  //     "event CreateSolution(bytes32 id)",
  //   ]);
  //   const solutionId = iface.parseLog(receipt.logs[0]).args.id;

  //   //Create proposal
  //   let tx2 = await this.ProposalsHub.connect(this.keeper).createProposal(
  //     this.ToyToken.address,
  //     this.SolutionsHub.address,
  //     100,
  //     solutionId
  //   );
  //   let receipt2 = await tx2.wait();
  //   let iface2 = new ethers.utils.Interface([
  //     "event CreateProposal(bytes32 id)",
  //   ]);
  //   const proposalId = iface2.parseLog(receipt2.logs[0]).args.id;
  //   const proposal = await this.ProposalsHub.getProposal(proposalId);

  //   //Fund and execute Proposal
  //   await this.ToyToken.connect(this.buyer).approve(
  //     this.ProposalsHub.address,
  //     100
  //   );
  //   await this.ProposalsHub.connect(this.buyer).fundProposal(
  //     proposalId,
  //     this.ToyToken.address,
  //     100
  //   );

  //   await this.ProposalsHub.executeProposal(proposalId);

  //   const primeSolverAddress = await this.SolutionsHub.solverFromIndex(solutionId, 0);
  //   const solverERC20Balance = await this.ToyToken.balanceOf(primeSolverAddress);
  //   const CTERC20Balance = await this.ToyToken.balanceOf(this.CT.address);
  //   // Collateral has been sent to CT contract
  //   expect(solverERC20Balance).to.equal(0);
  //   expect(CTERC20Balance).to.equal(100);


  //   // Connect to our Prime Solver
  //   let primeSolver = new ethers.Contract(primeSolverAddress, SOLVER_ABI, ethers.provider);

  //   const condition = await primeSolver.canonCondition()
  //   const conditionId = condition['conditionId']

  //   // Seller should have all the success tokens
  //   const indexSetSuccess = getIndexSetFromBinaryArray([1,0]) // If success
  //   const collectionIdSuccess = await this.CT.getCollectionId(ethers.constants.HashZero, conditionId, indexSetSuccess)
  //   const positionIdSuccess = await this.CT.getPositionId(this.ToyToken.address, collectionIdSuccess)
  //   const buyerSuccessBalance = await this.CT.balanceOf(this.buyer.address, positionIdSuccess)
  //   const sellerSuccessBalance = await this.CT.balanceOf(this.seller.address, positionIdSuccess)
  //   expect(buyerSuccessBalance).to.equal(0)
  //   expect(sellerSuccessBalance).to.equal(100)


  //   // Buyer should have all the failure tokens
  //   const indexSetFailure = getIndexSetFromBinaryArray([0,1]) // If failure
  //   const collectionIdFailure = await this.CT.getCollectionId(ethers.constants.HashZero, conditionId, indexSetFailure)
  //   const positionIdFailure = await this.CT.getPositionId(this.ToyToken.address, collectionIdFailure)
  //   const buyerFailureBalance = await this.CT.balanceOf(this.buyer.address, positionIdFailure)
  //   const sellerFailureBalance = await this.CT.balanceOf(this.seller.address, positionIdFailure)
  //   expect(buyerFailureBalance).to.equal(100)
  //   expect(sellerFailureBalance).to.equal(0)

  //   // Keeper proposes payouts
  //   await primeSolver.connect(this.keeper).proposePayouts([1,0]);
  //   const payouts = await primeSolver.getPayouts();
  //   expect(payouts[0]).to.equal(1)
  //   expect(payouts[1]).to.equal(0)

  //   // We set timelock to 0, so confirm right away
  //   await primeSolver.connect(this.keeper).confirmPayouts();

  //   // Seller redeems tokens
  //   await this.CT.connect(this.seller).redeemPositions(this.ToyToken.address, ethers.constants.HashZero, conditionId, [indexSetSuccess, indexSetFailure])
  //   const sellerERC20Balance = await this.ToyToken.balanceOf(this.seller.address);
  //   expect(sellerERC20Balance).to.equal(100);
  // });
});
