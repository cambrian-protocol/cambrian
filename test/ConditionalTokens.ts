const { ethers } = require("hardhat")
const { expect } = require("chai")
const { getConditionId } = require("../helpers/ConditionalTokens")

describe("ConditionalTokens contract", function() {
    it("Should prepare a 2-slot condition", async function() {
        const [buyer, seller, oracle] = await ethers.getSigners();

        const CTFactory = await ethers.getContractFactory("ConditionalTokens")
        const CT = await CTFactory.deploy();

        const questionId = ethers.utils.formatBytes32String("Test")
        
        await CT.prepareCondition(oracle.address, questionId, 2, {from: buyer.address})

        const conditionId = getConditionId(oracle.address, questionId, 2)

        expect(await CT.payoutDenominators(conditionId)).to.equal(2)
    })
})