const { deployments } = require("hardhat");
const hre = require("hardhat");
const ethers = hre.ethers;
const FACTORY_ABI =
  require("../artifacts/contracts/solvers/SolverFactory.sol/SolverFactory.json").abi;
const ERC20_ABI =
  require("../artifacts/contracts/tokens/ToyToken.sol/ToyToken.json").abi;

const { getBytes32FromMultihash } = require("../helpers/multihash.js");

const testHelpers = require("../helpers/testHelpers.js");

async function main() {
  const [user0, user1, keeper] = await ethers.getSigners();

  const BasicSolverV1Address = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
  const ArbitratorAddress = "0x6F1216D1BFe15c98520CA1434FC1d9D57AC95321";

  const SolverFactory = new ethers.Contract(
    "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512",
    new ethers.utils.Interface(FACTORY_ABI),
    ethers.getDefaultProvider()
  );

  const ToyToken = new ethers.Contract(
    "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
    new ethers.utils.Interface(ERC20_ABI),
    ethers.getDefaultProvider()
  );

  await ToyToken.connect(user0).mint(user0.address, "1000000000000000000000");

  // Solver Config
  const timelockSeconds = 1000;
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
      data: ethers.utils.defaultAbiCoder.encode(["address"], [user0.address]),
    },
    {
      executions: 0,
      ingestType: 1,
      slot: ethers.utils.formatBytes32String("2"),
      solverIndex: 0,
      data: ethers.utils.defaultAbiCoder.encode(["address"], [user1.address]),
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
    collateralToken: ToyToken.address,
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
      BasicSolverV1Address,
      keeper.address,
      ArbitratorAddress,
      timelockSeconds,
      [],
      ingests,
      conditionBase,
    ],
  ];

  const solvers = await testHelpers.deploySolverChain(
    solverConfigs,
    SolverFactory,
    keeper
  );

  const solver = solvers[0];

  console.log("Solver deployed to: ", solver.address);

  await ToyToken.connect(user0).transfer(
    solver.address,
    "1000000000000000000000"
  );

  console.log("Transferred 1000000000000000000000 Toy to Solver");

  await solver.connect(keeper).prepareSolve(0);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
