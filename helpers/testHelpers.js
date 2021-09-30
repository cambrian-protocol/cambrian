const { ethers } = require("hardhat");
const CT_ABI = require("../artifacts/contracts/ConditionalTokens.sol/ConditionalTokens.json").abi;



const getSimpleSolverConfig = (collateralAddress, amount, implementationAddress, keeperAddress, arbitratorAddress, buyerAddress, sellerAddress) => {
    const ingests = [
        {
          executions: 0,
          isDeferred: false,
          isConstant: true,
          dataType: 0,
          key: 1,
          solverIndex: 0,
          data: ethers.utils.defaultAbiCoder.encode(['address'], [buyerAddress])
        },
        {
          executions: 0,
          isDeferred: false,
          isConstant: true,
          dataType: 0,
          key: 2,
          solverIndex: 0,
          data: ethers.utils.defaultAbiCoder.encode(['address'], [sellerAddress])
        },
        {
          executions: 0,
          isConstant: true,
          dataType: 3,
          key: 0,
          solverIndex: 0,
          data: ethers.utils.defaultAbiCoder.encode(['bytes32'], [ethers.utils.formatBytes32String("")])
        },
        {
          executions: 0,
          isConstant: true,
          dataType: 4,
          key: 3,
          solverIndex: 0,
          data: ethers.utils.defaultAbiCoder.encode(['uint256'], [0])
        },
        {
          executions: 0,
          isConstant: true,
          dataType: 4,
          key: 4,
          solverIndex: 0,
          data: ethers.utils.defaultAbiCoder.encode(['uint256'], [amount])
        }
      ]


      const canon = {
        collateralToken: collateralAddress,
        outcomeSlots: 2,
        parentCollectionIndexSet: 0,
        amount: amount,
        partition: [1,2],
        recipientAddressSlots: [1,2],
        recipientAmountSlots: [[3,4],[4,3]],
        conditionURI: ""
      }
  
      const solverConfigs = [
        [
          implementationAddress,
          keeperAddress,
          arbitratorAddress,
          0,
          ethers.utils.formatBytes32String(""),
          ingests,
          canon
        ]
      ];

      return solverConfigs
}

const getSimpleSolutionConfig = (testID, amount, implementationAddress, keeperAddress, arbitratorAddress, buyerAddress, sellerAddress, toyToken) => {
    return (
        [testID, toyToken, getSimpleSolverConfig(toyToken, amount, implementationAddress, keeperAddress, arbitratorAddress, buyerAddress,sellerAddress)]
    )
}

const getCTBalances = async(CT, address, solver, indexSets) => {
  let promises = [];
  let CTBalances = [];

  const conditions = await solver.getConditions()
  const condition = conditions[conditions.length-1];

  indexSets.forEach((partition, i) => {
    let p = CT.getCollectionId(
      condition.parentCollectionId, 
      condition.conditionId,
      partition
      ).then(collectionId => {
        return CT.getPositionId(condition.collateralToken, collectionId)
      }).then(positionId => {
        CTBalances.push({
          positionId: positionId.toString(),
          value: null
        });
        return CT.balanceOf(address, positionId)
      }).then(balance => {
        CTBalances[i].value = balance.toString()
      })
      promises.push(p);
  })
  await Promise.all(promises);
  console.log(`${address} balances: `, CTBalances);
  return CTBalances;
}


const redeemPositions = async(CT, signer, solver, indexSets) => {
  const conditions = await solver.getConditions()

  conditions.forEach(async condition => {
    const tx = await CT.connect(signer).redeemPositions(
      condition.collateralToken, 
      condition.parentCollectionId, 
      condition.conditionId,
      indexSets
    )
  
    const rc = await tx.wait()
    let iface = new ethers.utils.Interface(CT_ABI);
    let events = rc.logs.map(log => {
      try {
        return iface.parseLog(log)
      } catch(err){}
    });
    
    events.forEach(event => {
      if (event && event.name == "PayoutRedemption"){
        console.log("ParentCollectionId: ", event.args.parentCollectionId)
        console.log("Payout: ",event.args.payout.toString())
      }
  })

  })
}

module.exports = {getSimpleSolverConfig, getSimpleSolutionConfig, getCTBalances, redeemPositions}