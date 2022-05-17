const { ethers, deployments } = require("hardhat");
const SOLVER_ABI =
  require("@cambrian/core/artifacts/contracts/solvers/Solver.sol/Solver.json").abi;
const ARBITRATION_DISPATCH_ABI =
  require("@cambrian/core/artifacts/contracts/arbitration/ArbitrationDispatch.sol/ArbitrationDispatch.json").abi;

const { FormatTypes } = require("ethers/lib/utils");

const testHelpers = require("@cambrian/core/helpers/testHelpers.js");
const {
  getBytes32FromMultihash,
} = require("@cambrian/core/helpers/multihash.js");

async function main() {
  const [buyer, seller, keeper, arbitrator] = await ethers.getSigners();
  this.buyer = buyer;
  this.seller = seller;
  this.keeper = keeper;
  this.arbitrator = arbitrator;

  await deployments.fixture(["SolverFactory", "ToyToken", "BasicSolverV1"]);

  this.SolverFactory = await ethers.getContract("SolverFactory");
  this.ToyToken = await ethers.getContract("ToyToken");
  this.Solver = await ethers.getContract("BasicSolverV1");
  this.ISolver = new ethers.utils.Interface(SOLVER_ABI);
  this.ISolver.format(FormatTypes.full);

  this.ArbitrationDispatch = new ethers.Contract(
    "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",

    new ethers.utils.Interface(ARBITRATION_DISPATCH_ABI),
    ethers.getDefaultProvider()
  );

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
      getBytes32FromMultihash("QmYZB6LDtGqqfJyhJDEp7rgFgEVSm7H7yyXZjhvCqVkYvZ"),
      getBytes32FromMultihash("QmPrcQH4akfr7eSn4tQHmmudLdJpKhHskVJ5iqYxCks1FP"),
    ],
  };

  const solverConfigs = [
    [
      this.Solver.address,
      this.keeper.address,
      this.arbitrator.address,
      0,
      ethers.utils.formatBytes32String(""),
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

  tx = await this.ArbitrationDispatch.connect(this.buyer).requestArbitration(
    solvers[0].address,
    0
  );
  await tx.wait();
  res = await tx.wait();
  console.log(res);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
