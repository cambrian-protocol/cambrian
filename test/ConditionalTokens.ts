const { ethers } = require("hardhat")
const { expect } = require("chai")

describe("ConditionalTokens contract", function() {
    it("Should prepare a 2-slot condition", async function() {
        const [buyer, seller, oracle] = await ethers.getSigners();

        const CTFactory = await ethers.getContractFactory("ConditionalTokens")
        const CT = await CTFactory.deploy();

        const questionId = ethers.utils.formatBytes32String("Test")
        const conditionId = await CT.getConditionId(oracle.address, questionId, 2)
        
        await CT.prepareCondition(oracle.address, questionId, 2, {from: buyer.address})
        
        const outcomeSlotCount = await CT.functions.getOutcomeSlotCount(conditionId)
        
        const badConditionId = await CT.getConditionId(oracle.address, questionId, 3)
        const badOutcomeSlotCount = await CT.functions.getOutcomeSlotCount(badConditionId)


        expect(outcomeSlotCount[0]).to.equal(2)
        expect(badOutcomeSlotCount[0]).to.equal(0)
    })
})