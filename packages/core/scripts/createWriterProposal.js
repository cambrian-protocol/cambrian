const hre = require("hardhat");
const ethers = hre.ethers;
const Hash = require("ipfs-only-hash");
const { getBytes32FromMultihash } = require("../helpers/multihash");
const ERC20_ABI =
  require("@cambrian/core/artifacts/contracts/ToyToken.sol/ToyToken.json").abi;

const PROPOSALSHUB_ABI =
  require("@cambrian/core/artifacts/contracts/ProposalsHub.sol/ProposalsHub.json").abi;

const ULID = require("ulid");

async function main() {
  const [user1] = await ethers.getSigners();

  const ProposalsHub = new ethers.Contract(
    "0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0",
    new ethers.utils.Interface(PROPOSALSHUB_ABI),
    ethers.getDefaultProvider()
  );
  const ToyToken = new ethers.Contract(
    "0x0165878A594ca255338adfa4d48449f69242Eb8F",
    new ethers.utils.Interface(ERC20_ABI),
    ethers.getDefaultProvider()
  );

  await ToyToken.connect(user1).mint(user1.address, "1000000000000000000000");

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

  const solutionId = ethers.utils.formatBytes32String(ULID.ulid());
  const cid = await Hash.of(JSON.stringify(solverConfigs));
  const blankObjCID = await Hash.of(JSON.stringify({}));

  const tx = await ProposalsHub.connect(user1).createIPFSSolutionAndProposal(
    solutionId,
    ToyToken.address,
    ethers.utils.getAddress("0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9"),
    "1000000000000000000000",
    solverConfigs,
    getBytes32FromMultihash(cid),
    getBytes32FromMultihash(blankObjCID)
  );
  const res = await tx.wait();
  const proposalId = res.events[1].args.id;

  //Fund Proposal
  await ToyToken.connect(user1).approve(
    ProposalsHub.address,
    "1000000000000000000000"
  );

  await ProposalsHub.connect(user1).fundProposal(
    proposalId,
    ToyToken.address,
    "1000000000000000000000"
  );

  const tx2 = await ProposalsHub.connect(user1).executeIPFSProposal(
    proposalId,
    solverConfigs
  );

  const res2 = await tx2.wait();

  console.log(res2);

  console.log("Executed Proposal");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
