const { ethers } = require("hardhat")

const getConditionId = (oracle, questionId, outcomeSlotCount) => {
    return(ethers.utils.keccak256(oracle, questionId, outcomeSlotCount))
}