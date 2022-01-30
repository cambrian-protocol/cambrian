const { ethers, deployments } = require("hardhat");
const { expect } = require("chai");
const testHelpers = require("../../helpers/testHelpers.js");
const { getBytes32FromMultihash } = require("../../helpers/multihash.js");

const ctHelpers = require("../../helpers/ConditionalTokens.js");

describe("Transformer export test", function () {
  this.beforeEach(async function () {
    const [buyer, seller, keeper, arbitrator] = await ethers.getSigners();
    this.buyer = buyer;
    this.seller = seller;
    this.keeper = keeper;
    this.arbitrator = arbitrator;

    console.log("buyer address: ", buyer.address);
    console.log("seller address: ", seller.address);
    console.log("keeper address: ", keeper.address);
    console.log("arbitrator address: ", arbitrator.address);

    await deployments.fixture([
      "ConditionalTokens",
      "SolverFactory",
      "SolutionsHub",
      "ProposalsHub",
      "ToyToken",
      "BasicSolverV1",
      "IPFSSolutionsHub",
    ]);
    this.CT = await ethers.getContract("ConditionalTokens");
    this.SolverFactory = await ethers.getContract("SolverFactory");
    this.ToyToken = await ethers.getContract("ToyToken");
    console.log("ToyToken address: ", this.ToyToken.address);
    this.Solver = await ethers.getContract("BasicSolverV1");
    console.log("Solver address: ", this.Solver.address);
    await this.ToyToken.mint(this.buyer.address, "100");
  });

  it("Should execute single-solver Proposal with two outcomes", async function () {
    const solverConfigs = [
      {
        implementation: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
        keeper: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        arbitrator: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        timelockSeconds: 0,
        data: "0x0000000000000000000000000000000000000000000000000000000000000000",
        ingests: [
          {
            executions: 0,
            ingestType: 1,
            slot: 0,
            solverIndex: 0,
            data: "0x0000000000000000000000000000000000000000000000000000000000002710",
          },
          {
            executions: 0,
            ingestType: 1,
            slot: 1,
            solverIndex: 0,
            data: "0x0000000000000000000000000000000000000000000000000000000000000000",
          },
          {
            executions: 0,
            ingestType: 1,
            slot: 2,
            solverIndex: 0,
            data: "0x00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8",
          },
          {
            executions: 0,
            ingestType: 1,
            slot: 3,
            solverIndex: 0,
            data: "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
          },
        ],
        conditionBase: {
          collateralToken: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
          outcomeSlots: 2,
          parentCollectionIndexSet: 0,
          partition: [1, 2],
          amountSlot: 0,
          recipientAddressSlots: [2, 3],
          recipientAmountSlots: [
            [0, 1],
            [1, 0],
          ],
          outcomeURIs: [
            {
              digest:
                "0x97ca31806fc612ce2ef23118037b94846ae79148da7310686f1dadcc5bbbf136",
              hashFunction: 18,
              size: 32,
            },
            {
              digest:
                "0x168880916cd84cd88599b75417697c6703e7ca2a24c8d03578e08f2efef62de2",
              hashFunction: 18,
              size: 32,
            },
          ],
        },
      },
    ];

    // Deploy solverChain
    let solvers = await testHelpers.deploySolverChain(
      solverConfigs,
      this.SolverFactory,
      this.keeper
    );

    //Fund and execute Solver chain
    await this.ToyToken.connect(this.buyer).transfer(solvers[0].address, 100);
    await solvers[0].connect(this.keeper).prepareSolve(0);
    await solvers[0].connect(this.keeper).executeSolve(0);

    const conditions = await solvers[0].getConditions();

    // Seller should have all the success tokens
    const indexSetSuccess = ctHelpers.getIndexSetFromBinaryArray([1, 0]); // If success
    const indexSetFailure = ctHelpers.getIndexSetFromBinaryArray([0, 1]); // If failure

    // Keeper proposes payouts
    await solvers[0].connect(this.keeper).proposePayouts(0, [1, 0]);

    const conditionsProposed = await solvers[0].getConditions();
    const payouts = conditionsProposed[conditionsProposed.length - 1].payouts;
    expect(payouts[0]).to.equal(1);
    expect(payouts[1]).to.equal(0);

    // We set timelock to 0, so confirm right away
    await solvers[0].connect(this.keeper).confirmPayouts(0);

    // Seller redeems tokens
    await this.CT.connect(this.seller).redeemPositions(
      this.ToyToken.address,
      ethers.constants.HashZero,
      conditions[conditions.length - 1].conditionId,
      [indexSetSuccess, indexSetFailure]
    );
    const sellerERC20Balance = await this.ToyToken.balanceOf(
      this.seller.address
    );
    expect(sellerERC20Balance).to.equal(100);
  });
});
