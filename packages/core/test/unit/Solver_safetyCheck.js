const { ethers, deployments } = require("hardhat");
const { expect } = require("chai");
const SOLVER_ABI =
  require("../../artifacts/contracts/solvers/Solver.sol/Solver.json").abi;
const {
  expectRevert, // Assertions for transactions that should fail
  expectEvent,
} = require("@openzeppelin/test-helpers");
const { getBytes32FromMultihash } = require("../../helpers/multihash.js");

describe("Solver | deployChild", function () {
  this.beforeEach(async function () {
    const [keeper, arbitrator] = await ethers.getSigners();
    this.keeper = keeper;
    this.arbitrator = arbitrator;

    await deployments.fixture([
      "ConditionalTokens",
      "SolverFactory",
      "ProposalsHub",
      "ToyToken",
      "BasicSolverV1",
      "IPFSSolutionsHub",
      "ProposalsHub",
    ]);

    this.ProposalsHub = await ethers.getContract("ProposalsHub");
    this.ConditionalTokens = await ethers.getContract("ConditionalTokens");
    this.SolverFactory = await ethers.getContract("SolverFactory");
    this.ToyToken = await ethers.getContract("ToyToken");
    this.Solver = await ethers.getContract("BasicSolverV1");

    // this.timelockSeconds = 1;

    // this.ingests = [
    //   {
    //     executions: 0,
    //     ingestType: 1,
    //     slot: ethers.utils.formatBytes32String("0"),
    //     solverIndex: 0, // Ignored for ingestType.constant
    //     data: ethers.utils.defaultAbiCoder.encode(
    //       ["address"],
    //       [this.ToyToken.address]
    //     ),
    //   },
    //   {
    //     executions: 0,
    //     ingestType: 1,
    //     slot: ethers.utils.formatBytes32String("1"),
    //     solverIndex: 0, // Ignored for ingestType.constant
    //     data: ethers.utils.defaultAbiCoder.encode(["uint256"], [0]),
    //   },
    // ];

    // this.conditionBase = {
    //   collateralToken: this.ToyToken.address,
    //   outcomeSlots: 2,
    //   parentCollectionIndexSet: 0,
    //   amountSlot: ethers.utils.formatBytes32String("0"),
    //   partition: [0, 0],
    //   allocations: [
    //     {
    //       recipientAddressSlot: ethers.utils.formatBytes32String("0"),
    //       recipientAmountSlots: [
    //         ethers.utils.formatBytes32String("0"),
    //         ethers.utils.formatBytes32String("0"),
    //       ],
    //     },
    //   ],
    //   outcomeURIs: [
    //     "QmYZB6LDtGqqfJyhJDEp7rgFgEVSm7H7yyXZjhvCqVkYvZ",
    //     "QmPrcQH4akfr7eSn4tQHmmudLdJpKhHskVJ5iqYxCks1FP",
    //   ],
    // };

    // this.solverConfigs = [
    //   {
    //     implementation: this.Solver.address,
    //     keeper: this.keeper.address,
    //     arbitrator: this.arbitrator.address,
    //     timelockSeconds: this.timelockSeconds,
    //     moduleLoaders: [],
    //     ingests: this.ingests,
    //     conditionBase: this.conditionBase,
    //   },
    // ];
  });

  it("Can't send conditional tokens to contract without onERC1155BatchReceived", async function () {
    await expectRevert(
      this.ConditionalTokens.connect(
        this.keeper
      ).callStatic.safeBatchTransferFrom(
        this.keeper.address,
        this.ToyToken.address,
        [42], // some token ID
        [0], // zero amount,
        ethers.constants.HashZero
      ),
      "ERC1155: transfer to non ERC1155Receiver implementer"
    );
  });

  // it("Can send conditional tokens to EOA", async function () {
  //   const tx = await this.ConditionalTokens.connect(
  //     this.keeper
  //   ).callStatic.safeBatchTransferFrom(
  //     this.keeper.address,
  //     this.keeper.address,
  //     [42], // some token ID
  //     [0], // zero amount,
  //     ethers.constants.HashZero
  //   );

  //   const receipt = await tx.wait();

  //   console.log(receipt);

  //   inReceipt(receipt, "TransferBatch", {
  //     operator: this.keeper.address,
  //     from: this.keeper.address,
  //     to: this.keeper.address,
  //     ids: [ethers.BigNumber.from("42")],
  //   });
  // });
});

function inReceipt(receipt, eventName, eventArgs) {
  if (receipt.events == undefined) {
    throw new Error("No events found in receipt");
  }

  const events = receipt.events.filter((e) => e.event === eventName);
  expect(events.length > 0).to.equal(true, `No '${eventName}' events found`);

  const exceptions = [];
  const event = events.find(function (e) {
    for (const [k, v] of Object.entries(eventArgs)) {
      try {
        if (e.args == undefined) {
          throw new Error("Event has no arguments");
        }

        contains(e.args, k, v);
      } catch (error) {
        exceptions.push(error);
        return false;
      }
    }
    return true;
  });

  if (event === undefined) {
    // Each event entry may have failed to match for different reasons,
    // throw the first one
    throw exceptions[0];
  }

  return event;
}

function contains(args, key, value) {
  expect(key in args).to.equal(true, `Event argument '${key}' not found`);

  if (value === null) {
    expect(args[key]).to.equal(
      null,
      `expected event argument '${key}' to be null but got ${args[key]}`
    );
  } else if (
    ethers.BigNumber.isBigNumber(args[key]) ||
    ethers.BigNumber.isBigNumber(value)
  ) {
    const actual = ethers.BigNumber.isBigNumber(args[key])
      ? args[key].toString()
      : args[key];
    const expected = ethers.BigNumber.isBigNumber(value)
      ? value.toString()
      : value;

    expect(args[key]).to.equal(
      value,
      `expected event argument '${key}' to have value ${expected} but got ${actual}`
    );
  } else {
    expect(args[key]).to.be.deep.equal(
      value,
      `expected event argument '${key}' to have value ${value} but got ${args[key]}`
    );
  }
}
