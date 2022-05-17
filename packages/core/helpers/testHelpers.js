const { ethers } = require("hardhat");
const CT_ABI =
  require("../artifacts/contracts/conditionalTokens/ConditionalTokens.sol/ConditionalTokens.json").abi;
const SOLVER_ABI =
  require("../artifacts/contracts/solvers/Solver.sol/Solver.json").abi;
const { getBytes32FromMultihash } = require("./multihash.js");

const getSimpleSolverConfig = (
  collateralAddress,
  amount,
  implementationAddress,
  keeperAddress,
  arbitratorAddress,
  buyerAddress,
  sellerAddress
) => {
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
      data: ethers.utils.defaultAbiCoder.encode(["address"], [buyerAddress]),
    },
    {
      executions: 0,
      ingestType: 1,
      slot: ethers.utils.formatBytes32String("2"),
      solverIndex: 0,
      data: ethers.utils.defaultAbiCoder.encode(["address"], [sellerAddress]),
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
      data: ethers.utils.defaultAbiCoder.encode(["uint256"], [amount]),
    },
  ];

  const canon = {
    collateralToken: collateralAddress,
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
      implementationAddress,
      keeperAddress,
      arbitratorAddress,
      0,
      ethers.utils.formatBytes32String(""),
      ingests,
      canon,
    ],
  ];

  return solverConfigs;
};

// abiCoder.encode(
//   [
//     "(tuple(address, address, address, timelockSeconds, bytes, tuple(uint executions, uint ingestType, uint slot, uint solverIndex, bytes data) ingests, tuple(address collateralToken, uint outcomeSlots, uint parentCollectionIndexSet, uint amountSlot, uint[] partition, uint[] recipientAddressSlots, uint[][] recipientAmountSlots, (bytes32 digest, uint8 hashFunction, uint8 size))))[]",
//   ],
//   [1234, { b: 5678, c: "Hello World" }]
// );

const getSimpleSolutionConfig = (
  testID,
  amount,
  implementationAddress,
  keeperAddress,
  arbitratorAddress,
  buyerAddress,
  sellerAddress,
  toyToken
) => {
  return [
    testID,
    toyToken,
    getSimpleSolverConfig(
      toyToken,
      amount,
      implementationAddress,
      keeperAddress,
      arbitratorAddress,
      buyerAddress,
      sellerAddress
    ),
  ];
};

const getCTBalances = async (CT, address, solver, indexSets) => {
  let promises = [];
  let CTBalances = [];

  const conditions = await solver.getConditions();
  const condition = conditions[conditions.length - 1];

  indexSets.forEach((partition, i) => {
    let p = CT.getCollectionId(
      condition.parentCollectionId,
      condition.conditionId,
      partition
    )
      .then((collectionId) => {
        return CT.getPositionId(condition.collateralToken, collectionId);
      })
      .then((positionId) => {
        return CT.balanceOf(address, positionId);
      })
      .then((balance) => {
        CTBalances.push(parseInt(balance.toString()));
      });
    promises.push(p);
  });
  await Promise.all(promises);
  // console.log(`${address} balances: `, CTBalances);
  return CTBalances;
};

const redeemPositions = async (CT, signer, solver, indexSets) => {
  const conditions = await solver.getConditions();

  conditions.forEach(async (condition) => {
    if (condition.status > 4) {
      const tx = await CT.connect(signer).redeemPositions(
        condition.collateralToken,
        condition.parentCollectionId,
        condition.conditionId,
        indexSets
      );

      const rc = await tx.wait();
      let iface = new ethers.utils.Interface(CT_ABI);
      let events = rc.logs.map((log) => {
        try {
          return iface.parseLog(log);
        } catch (err) {}
      });
    }

    //   events.forEach(event => {
    //     if (event && event.name == "PayoutRedemption"){
    //       console.log("ParentCollectionId: ", event.args.parentCollectionId)
    //       console.log("Payout: ",event.args.payout.toString())
    //     }
    // })
  });
};

const deploySolverChain = async (solverConfigs, factory, signer) => {
  let solvers = [];
  let promises = [];

  await factory
    .createSolver(ethers.constants.AddressZero, 0, solverConfigs[0])
    .then((tx) => tx.wait())
    .then((rc) => {
      solvers.push(
        new ethers.Contract(
          ethers.utils.defaultAbiCoder.decode(
            ["address"],
            rc.events[1].data
          )[0],
          SOLVER_ABI,
          ethers.provider
        )
      );
    });

  solverConfigs.forEach((config, index) => {
    if (index > 0) {
      let p = solvers[index - 1]
        .connect(signer)
        .deployChild(config)
        .then((tx) => tx.wait())
        .then((rc) => {
          solvers.push(
            new ethers.Contract(
              ethers.utils.defaultAbiCoder.decode(
                ["address"],
                rc.events[1].data
              )[0],
              SOLVER_ABI,
              ethers.provider
            )
          );
        });
      promises.push(p);
    }
  });

  await Promise.all(promises);

  return solvers;
};

module.exports = {
  getSimpleSolverConfig,
  getSimpleSolutionConfig,
  getCTBalances,
  redeemPositions,
  deploySolverChain,
};
