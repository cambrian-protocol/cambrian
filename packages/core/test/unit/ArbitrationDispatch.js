const { ethers, deployments } = require("hardhat");
const { expect } = require("chai");
const SOLVER_ABI =
  require("../../artifacts/contracts/solvers/Solver.sol/Solver.json").abi;
const {
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");
const { FormatTypes } = require("ethers/lib/utils");

const testHelpers = require("../../helpers/testHelpers.js");
const { getBytes32FromMultihash } = require("../../helpers/multihash.js");

describe("ArbitrationDispatch", function () {
  this.beforeEach(async function () {
    const [buyer, seller, keeper, arbitrator] = await ethers.getSigners();
    this.buyer = buyer;
    this.seller = seller;
    this.keeper = keeper;
    this.arbitrator = arbitrator;

    await deployments.fixture(["test"]);

    this.ArbitrationDispatch = await ethers.getContract("ArbitrationDispatch");
    this.SolverFactory = await ethers.getContract("SolverFactory");
    this.ToyToken = await ethers.getContract("ToyToken");
    this.Solver = await ethers.getContract("BasicSolverV1");
    this.ISolver = new ethers.utils.Interface(SOLVER_ABI);
    this.ISolver.format(FormatTypes.full);

    this.timelockSeconds = 0;
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
        "QmYZB6LDtGqqfJyhJDEp7rgFgEVSm7H7yyXZjhvCqVkYvZ",
        "QmPrcQH4akfr7eSn4tQHmmudLdJpKhHskVJ5iqYxCks1FP",
      ],
    };
  });

  it("Allows requesting arbitration when status.OutcomeProposed", async function () {
    const solverConfigs = [
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

    const solvers = await testHelpers.deploySolverChain(
      solverConfigs,
      this.SolverFactory,
      this.keeper
    );

    await solvers[0].connect(this.keeper).prepareSolve(0);
    await solvers[0].connect(this.keeper).executeSolve(0);
    await solvers[0].connect(this.keeper).proposePayouts(0, [1, 0]);

    tx = await this.ArbitrationDispatch.requestArbitration(
      solvers[0].address,
      0
    );
    await tx.wait();
    res = await tx.wait();

    expect(res.events[0].event).to.equal("RequestedArbitration");
  });

  it("Allows requesting arbitration when status.ArbitrationRequested", async function () {
    const solverConfigs = [
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

    const solvers = await testHelpers.deploySolverChain(
      solverConfigs,
      this.SolverFactory,
      this.keeper
    );

    await solvers[0].connect(this.keeper).prepareSolve(0);
    await solvers[0].connect(this.keeper).executeSolve(0);
    await solvers[0].connect(this.keeper).proposePayouts(0, [1, 0]);

    await solvers[0].connect(this.arbitrator).requestArbitration(0);

    tx = await this.ArbitrationDispatch.requestArbitration(
      solvers[0].address,
      0
    );
    await tx.wait();
    res = await tx.wait();
    expect(res.events[0].event).to.equal("RequestedArbitration");
  });

  it("Rejects requesting arbitration when status.Initiated", async function () {
    const solverConfigs = [
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

    const solvers = await testHelpers.deploySolverChain(
      solverConfigs,
      this.SolverFactory,
      this.keeper
    );

    await solvers[0].connect(this.keeper).prepareSolve(0);

    return expectRevert(
      this.ArbitrationDispatch.requestArbitration(solvers[0].address, 0),
      "Condition status invalid for arbitration"
    );
  });

  it("Rejects requesting arbitration when status.Executed", async function () {
    const solverConfigs = [
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

    const solvers = await testHelpers.deploySolverChain(
      solverConfigs,
      this.SolverFactory,
      this.keeper
    );

    await solvers[0].connect(this.keeper).prepareSolve(0);
    await solvers[0].connect(this.keeper).executeSolve(0);

    return expectRevert(
      this.ArbitrationDispatch.requestArbitration(solvers[0].address, 0),
      "Condition status invalid for arbitration"
    );
  });

  it("Rejects requesting arbitration when status.OutcomeReported", async function () {
    const solverConfigs = [
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

    const solvers = await testHelpers.deploySolverChain(
      solverConfigs,
      this.SolverFactory,
      this.keeper
    );

    await solvers[0].connect(this.keeper).prepareSolve(0);
    await solvers[0].connect(this.keeper).executeSolve(0);
    await solvers[0].connect(this.keeper).proposePayouts(0, [0, 1]);
    await solvers[0].connect(this.keeper).confirmPayouts(0);

    return expectRevert(
      this.ArbitrationDispatch.requestArbitration(solvers[0].address, 0),
      "Condition status invalid for arbitration"
    );
  });

  it("Rejects requesting arbitration when contract arbitrator reverts", async function () {
    this.arbitrator = {
      address: this.SolverFactory.address,
    }; // Nonsense arbitrator to check revert

    const solverConfigs = [
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

    const solvers = await testHelpers.deploySolverChain(
      solverConfigs,
      this.SolverFactory,
      this.keeper
    );

    await solvers[0].connect(this.keeper).prepareSolve(0);
    await solvers[0].connect(this.keeper).executeSolve(0);
    await solvers[0].connect(this.keeper).proposePayouts(0, [0, 1]);

    return expectRevert(
      this.ArbitrationDispatch.requestArbitration(solvers[0].address, 0),
      "Arbitrator reverted"
    );
  });
});
