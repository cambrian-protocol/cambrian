const { deployments } = require("hardhat");
const hre = require("hardhat");
const ethers = hre.ethers;
const FACTORY_ABI =
  require("../artifacts/contracts/SolverFactory.sol/SolverFactory.json").abi;
const ERC20_ABI =
  require("../artifacts/contracts/ToyToken.sol/ToyToken.json").abi;

async function main() {
  const [user1] = await ethers.getSigners();

  const SolverFactory = new ethers.Contract(
    "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512",
    new ethers.utils.Interface(FACTORY_ABI),
    ethers.getDefaultProvider()
  );

  const ToyToken = new ethers.Contract(
    "0x0165878A594ca255338adfa4d48449f69242Eb8F",
    new ethers.utils.Interface(ERC20_ABI),
    ethers.getDefaultProvider()
  );

  await ToyToken.connect(user1).mint(user1.address, "100");

  const solverConfigs = [
    {
      implementation: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
      keeper: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      arbitrator: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      timelockSeconds: 0,
      data: "0x0000000000000000000000000000000000000000000000000000000000000000",
      ingests: [
        {
          executions: 0,
          ingestType: 1,
          slot: "0x303146535037364a344a333741514d3157525a44593835435933000000000000",
          solverIndex: 0,
          data: "0x0000000000000000000000000000000000000000000000000000000000000000",
        },
        {
          executions: 0,
          ingestType: 1,
          slot: "0x303146535037364a344a394e3339303550364d374a5146424432000000000000",
          solverIndex: 0,
          data: "0x0000000000000000000000000000000000000000000000000000000000002710",
        },
        {
          executions: 0,
          ingestType: 1,
          slot: "0x30314653503737543859435a33544b3530424d42364e43433557000000000000",
          solverIndex: 0,
          data: "0x0000000000000000000000003c44cdddb6a900fa2b585dd299e03d12fa4293bc",
        },
        {
          executions: 0,
          ingestType: 3,
          slot: "0x3031465350373845344b4d4d3548455142303942443854323533000000000000",
          solverIndex: 0,
          data: "0x0000000000000000000000000000000000000000000000000000000000000000",
        },
        {
          executions: 0,
          ingestType: 1,
          slot: "0x303146535037394a48364e464137333358583244423557355954000000000000",
          solverIndex: 0,
          data: "0x0000000000000000000000009965507d1a55bcc2695c58ba16fb37d819b0a4dc",
        },
        {
          executions: 0,
          ingestType: 1,
          slot: "0x30314653503741355a5a4558544e414d4b3544384d4859393346000000000000",
          solverIndex: 0,
          data: "0x00000000000000000000000015d34aaf54267db7d7c367839aaf71a00a2c6a65",
        },
        {
          executions: 0,
          ingestType: 1,
          slot: "0x303146535037414a484d56464b484b5454435658354d56434137000000000000",
          solverIndex: 0,
          data: "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        },
        {
          executions: 0,
          ingestType: 1,
          slot: "0x30314653503933523145365a5639514142363650504446444533000000000000",
          solverIndex: 0,
          data: "0x0000000000000000000000000000000000000000000000000000000000002328",
        },
        {
          executions: 0,
          ingestType: 1,
          slot: "0x3031465350393731413450483650534543365344485942335230000000000000",
          solverIndex: 0,
          data: "0x0000000000000000000000000000000000000000000000000000000000000190",
        },
        {
          executions: 0,
          ingestType: 1,
          slot: "0x30314653503937533754365336453938425a3746514a4a593230000000000000",
          solverIndex: 0,
          data: "0x00000000000000000000000000000000000000000000000000000000000000c8",
        },
      ],
      conditionBase: {
        collateralToken: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
        outcomeSlots: 2,
        parentCollectionIndexSet: 0,
        partition: [1, 2],
        amountSlot:
          "0x303146535037364a344a394e3339303550364d374a5146424432000000000000",
        allocations: [
          {
            recipientAddressSlot:
              "0x30314653503737543859435a33544b3530424d42364e43433557000000000000",
            recipientAmountSlots: [
              "0x3031465350393731413450483650534543365344485942335230000000000000",
              "0x3031465350393731413450483650534543365344485942335230000000000000",
            ],
          },
          {
            recipientAddressSlot:
              "0x3031465350373845344b4d4d3548455142303942443854323533000000000000",
            recipientAmountSlots: [
              "0x30314653503933523145365a5639514142363650504446444533000000000000",
              "0x303146535037364a344a333741514d3157525a44593835435933000000000000",
            ],
          },
          {
            recipientAddressSlot:
              "0x303146535037394a48364e464137333358583244423557355954000000000000",
            recipientAmountSlots: [
              "0x3031465350393731413450483650534543365344485942335230000000000000",
              "0x3031465350393731413450483650534543365344485942335230000000000000",
            ],
          },
          {
            recipientAddressSlot:
              "0x30314653503741355a5a4558544e414d4b3544384d4859393346000000000000",
            recipientAmountSlots: [
              "0x30314653503937533754365336453938425a3746514a4a593230000000000000",
              "0x30314653503937533754365336453938425a3746514a4a593230000000000000",
            ],
          },
          {
            recipientAddressSlot:
              "0x303146535037414a484d56464b484b5454435658354d56434137000000000000",
            recipientAmountSlots: [
              "0x303146535037364a344a333741514d3157525a44593835435933000000000000",
              "0x30314653503933523145365a5639514142363650504446444533000000000000",
            ],
          },
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

  let deployedAddress = await SolverFactory.connect(user1)
    .createSolver(ethers.constants.AddressZero, 0, solverConfigs[0])
    .then((tx) => tx.wait())
    .then(
      (rc) =>
        ethers.utils.defaultAbiCoder.decode(["address"], rc.events[0].data)[0]
    );

  console.log("Writing Solver deployed to: ", deployedAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
