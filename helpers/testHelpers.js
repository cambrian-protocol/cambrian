


const getSimpleSolverConfig = (amount, factoryAddress, keeperAddress, arbitratorAddress, buyerAddress, sellerAddress) => {
    const ingests = [
        {
          executions: 0,
          isDeferred: false,
          isConstant: true,
          port: 0,
          key: 1,
          solverIndex: 0,
          data: buyerAddress
        },
        {
          executions: 0,
          isDeferred: false,
          isConstant: true,
          port: 0,
          key: 2,
          solverIndex: 0,
          data: sellerAddress
        },
        {
          executions: 0,
          isConstant: true,
          port: 3,
          key: 0,
          solverIndex: 0,
          data: ethers.utils.formatBytes32String("")
        }
      ]

      const actions = [];

      const canon = {
        outcomeSlots: 2,
        parentCollectionPartitionIndex: 0,
        amount: amount,
        partition: [1,2],
        recipientAddressPorts: [[1,2],[1,2]],
        recipientAmounts: [[0,amount],[amount,0]],
        metadata: ""
      }
  
      const solverConfigs = [
        [
          factoryAddress,
          keeperAddress,
          arbitratorAddress,
          0,
          ethers.utils.formatBytes32String(""),
          ingests,
          actions,
          canon
        ]
      ];

      return solverConfigs
}

const getSimpleSolutionConfig = (testID, amount, factoryAddress, keeperAddress, arbitratorAddress, buyerAddress, sellerAddress, toyToken) => {
    return (
        [testID, toyToken, getSimpleSolverConfig(amount, factoryAddress, keeperAddress, arbitratorAddress, buyerAddress,sellerAddress)]
    )
}

module.exports = {getSimpleSolverConfig, getSimpleSolutionConfig}