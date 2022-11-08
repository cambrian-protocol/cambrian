const { ethers, deployments } = require("hardhat");
const { expect } = require("chai");
const SOLVER_ABI =
  require("../../artifacts/contracts/solvers/Solver.sol/Solver.json").abi;
const {
  expectRevert, // Assertions for transactions that should fail
  expectEvent,
} = require("@openzeppelin/test-helpers");
const { getBytes32FromMultihash } = require("../../helpers/multihash.js");

const { deploySolverChain } = require("../../helpers/testHelpers.js");

describe("ERC1155Rescue", function () {
  this.beforeEach(async function () {
    const [keeper, arbitrator] = await ethers.getSigners();
    this.keeper = keeper;
    this.arbitrator = arbitrator;

    await deployments.fixture(["test"]);

    this.ConditionalTokens = await ethers.getContract("ConditionalTokens");
    this.SolverFactory = await ethers.getContract("SolverFactory");
    this.ToyToken = await ethers.getContract("ToyToken");
    this.Solver = await ethers.getContract("BasicSolverV1");
    this.ERC1155Rescue = await ethers.getContract("ERC1155Rescue");
    this.ERC1155Unsafe = await ethers.getContract("ERC1155Unsafe");

    this.timelockSeconds = 0;

    this.ingests = [
      {
        executions: 0,
        ingestType: 1,
        slot: ethers.utils.formatBytes32String("0"),
        solverIndex: 0, // Ignored for ingestType.constant
        data: ethers.utils.defaultAbiCoder.encode(
          ["address"],
          [this.ERC1155Unsafe.address]
        ),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: ethers.utils.formatBytes32String("1"),
        solverIndex: 0, // Ignored for ingestType.constant
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], [0]),
      },
      {
        executions: 0,
        ingestType: 1,
        slot: ethers.utils.formatBytes32String("2"),
        solverIndex: 0, // Ignored for ingestType.constant
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], [10000]),
      },
    ];

    this.conditionBase = {
      collateralToken: this.ToyToken.address,
      outcomeSlots: 2,
      parentCollectionIndexSet: 0,
      amountSlot: ethers.utils.formatBytes32String("2"),
      partition: [1, 2],
      allocations: [
        {
          recipientAddressSlot: ethers.utils.formatBytes32String("0"),
          recipientAmountSlots: [
            ethers.utils.formatBytes32String("1"),
            ethers.utils.formatBytes32String("2"),
          ],
        },
      ],
      outcomeURIs: [
        "QmYZB6LDtGqqfJyhJDEp7rgFgEVSm7H7yyXZjhvCqVkYvZ",
        "QmPrcQH4akfr7eSn4tQHmmudLdJpKhHskVJ5iqYxCks1FP",
      ],
    };

    this.solverConfigs = [
      {
        implementation: this.Solver.address,
        keeper: this.keeper.address,
        arbitrator: this.arbitrator.address,
        timelockSeconds: this.timelockSeconds,
        moduleLoaders: [],
        ingests: this.ingests,
        conditionBase: this.conditionBase,
      },
    ];

    this.solver = (
      await deploySolverChain(
        this.solverConfigs,
        this.SolverFactory,
        this.keeper
      )
    )[0];

    await this.ToyToken.connect(this.keeper).mint(this.solver.address, "10000");
    await this.solver.connect(this.keeper).prepareSolve(0);
    await this.solver.connect(this.keeper).executeSolve(0);
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

  it("Catches and sends failed safeBatchTransfers to ERC1155Rescue", async function () {
    const events = await this.ERC1155Rescue.queryFilter(
      this.ERC1155Rescue.filters.ReceivedBag()
    );

    const { id, recipient, tokenIds, amounts } = events[0].args;

    expect(id).to.equal(
      "0x6dfef5a9e9d2089f5a05978b7ce051ba5a0f1c43bbfc24152289db749d02ca25"
    );
    expect(recipient).to.equal(this.ERC1155Unsafe.address);
    expect(tokenIds.map((x) => x.toString())).to.eql([
      "23511325211889549261937147619644442942599707999653846572582715585738850008381",
      "8349861763218502496239274050397800199519357925837744840033266719806426701526",
    ]);
    expect(amounts.map((x) => x.toString())).to.eql(["0", "10000"]);
  });

  it("Allows intended recipient of a failed transfer to call ERC1155Rescue-rescueBag", async function () {
    await this.ERC1155Unsafe.connect(this.keeper).rescueBag(
      "0x6dfef5a9e9d2089f5a05978b7ce051ba5a0f1c43bbfc24152289db749d02ca25",
      this.keeper.address
    );

    const balances = await this.ConditionalTokens.balanceOfBatch(
      [this.keeper.address, this.keeper.address],
      [
        "23511325211889549261937147619644442942599707999653846572582715585738850008381",
        "8349861763218502496239274050397800199519357925837744840033266719806426701526",
      ]
    );

    expect(balances.map((x) => x.toString())).to.eql(["0", "10000"]);
  });

  it("Reverts on unintended recipient calling ERC1155Rescue-rescueBag", async function () {
    await expectRevert(
      this.ERC1155Rescue.connect(this.keeper).rescueBag(
        "0x6dfef5a9e9d2089f5a05978b7ce051ba5a0f1c43bbfc24152289db749d02ca25",
        this.keeper.address
      ),
      "ERC1155Rescue::Only OG recipient"
    );
  });

  it("Reverts when calling ERC1155Rescue-rescueBag on previously rescued bag", async function () {
    await this.ERC1155Unsafe.connect(this.keeper).rescueBag(
      "0x6dfef5a9e9d2089f5a05978b7ce051ba5a0f1c43bbfc24152289db749d02ca25",
      this.keeper.address
    );

    await expectRevert(
      this.ERC1155Unsafe.connect(this.keeper).rescueBag(
        "0x6dfef5a9e9d2089f5a05978b7ce051ba5a0f1c43bbfc24152289db749d02ca25",
        this.keeper.address
      ),
      "ERC1155Rescue::Rescued"
    );
  });
});
