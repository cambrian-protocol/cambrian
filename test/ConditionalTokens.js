const { ethers } = require("hardhat")
const { expect } = require("chai")
const { getIndexSetFromBinaryArray } = require("../helpers/ConditionalTokens.js")

describe("ConditionalTokens contract", function() {

    this.beforeEach(async function() {
        const [buyer, seller, oracle] = await ethers.getSigners();
        this.buyer = buyer;
        this.seller = seller;
        this.oracle = oracle;
        
        this.CTFactory = await ethers.getContractFactory("ConditionalTokens")
        this.CT = await this.CTFactory.deploy()

        this.ToyTokenFactory = await ethers.getContractFactory("ToyToken")
        this.ToyToken = await this.ToyTokenFactory.deploy("TOY1", "T1")
        await this.ToyToken.mint(this.buyer.address, '100')
    })


    it("Should prepare a 2-slot condition", async function() {
        const questionId = ethers.utils.formatBytes32String("Test")
        const conditionId = await this.CT.getConditionId(this.oracle.address, questionId, 2)
        
        await this.CT.prepareCondition(this.oracle.address, questionId, 2, {from: this.buyer.address})
        
        const outcomeSlotCount = await this.CT.functions.getOutcomeSlotCount(conditionId)

        expect(outcomeSlotCount[0]).to.equal(2)
    })

    it("Should not have outcome slots for a non-existant condition", async function() {
        const badConditionId = await this.CT.getConditionId(this.oracle.address, ethers.utils.formatBytes32String("Bad Test"), 3)
        const badOutcomeSlotCount = await this.CT.functions.getOutcomeSlotCount(badConditionId)
        expect(badOutcomeSlotCount[0]).to.equal(0)
    })


    it("Should create a collection for A from 3-slot condition (A,B,C)", async function() {
        const questionId = ethers.utils.formatBytes32String("Test")
        
        await this.CT.prepareCondition(this.oracle.address, questionId, 3, {from: this.buyer.address})
        const conditionId = await this.CT.getConditionId(this.oracle.address, questionId, 3)

        const indexSetA = getIndexSetFromBinaryArray([1,0,0])

        const expectedCollectionId = await this.CT.getCollectionId(ethers.constants.HashZero, conditionId, Number(indexSetA))
        const collectionId = await this.CT.getCollectionId(ethers.constants.HashZero, conditionId, 0b001)
        expect(expectedCollectionId).to.equal(collectionId)
    })

    it("Should create a position for ToyToken at collection A from (A,B,C)", async function() {
        const questionId = ethers.utils.formatBytes32String("Test")
        
        const conditionId = await this.CT.getConditionId(this.oracle.address, questionId, 3)
        await this.CT.prepareCondition(this.oracle.address, questionId, 3, {from: this.buyer.address})


        const indexSetA = getIndexSetFromBinaryArray([1,0,0]) // If A
        const collectionIdA = await this.CT.getCollectionId(ethers.constants.HashZero, conditionId, indexSetA)
        const positionIdA = await this.CT.getPositionId(this.ToyToken.address, collectionIdA)

        const indexSetBC = getIndexSetFromBinaryArray([0,1,1]) // If B or C
        const collectionIdBC = await this.CT.getCollectionId(ethers.constants.HashZero, conditionId, indexSetBC)
        const positionIdBC = await this.CT.getPositionId(this.ToyToken.address, collectionIdBC)

        // ToyToken approves CT to transfer 100
        await this.ToyToken.approve(this.CT.address, 100)
        const allowance = await this.ToyToken.allowance(this.buyer.address, this.CT.address)
        expect(allowance).to.equal(100)


        // Split positions to A and B|C
        await this.CT.splitPosition(this.ToyToken.address, ethers.constants.HashZero, conditionId, [indexSetA, indexSetBC], '100', {from: this.buyer.address})

        const allowanceRemaining = await this.ToyToken.allowance(this.buyer.address, this.CT.address)
        expect(allowanceRemaining).to.equal(0)

        // Buyer has transfered tokens to CT contract
        const buyerBalance = await this.ToyToken.balanceOf(this.buyer.address)
        expect(buyerBalance).to.equal(0)

        // CT contract has Buyer's 100 toy token collateral
        const toyCTBalance = await this.ToyToken.balanceOf(this.CT.address)
        expect(toyCTBalance).to.equal(100)

        // Buyer has 100 CTs for position A
        let buyerCTBalance = await this.CT.balanceOf(this.buyer.address, positionIdA)
        expect(buyerCTBalance).to.equal(100)

        // Seller has nothing yet
        let sellerCTBalance = await this.CT.balanceOf(this.seller.address, positionIdA)
        expect(sellerCTBalance).to.equal(0)


        // Buyer transfers A CTs to Seller
        await this.CT.safeTransferFrom(this.buyer.address, this.seller.address, positionIdA, 100, '0x')

        buyerCTBalance = await this.CT.balanceOf(this.buyer.address, positionIdA)
        expect(buyerCTBalance).to.equal(0)

        sellerCTBalance = await this.CT.balanceOf(this.seller.address, positionIdA)
        expect(sellerCTBalance).to.equal(100)


        // Expect Buyer to still hold B|C
        buyerCTBalance = await this.CT.balanceOf(this.buyer.address, positionIdBC)
        expect(buyerCTBalance).to.equal(100)

        // Seller should have no B|C
        sellerCTBalance = await this.CT.balanceOf(this.seller.address, positionIdBC)
        expect(sellerCTBalance).to.equal(0)

        // Report result "A"
        await this.CT.connect(this.oracle).reportPayouts(questionId, [1,0,0])

        // Seller can redeem result "A"
        await this.CT.connect(this.seller).redeemPositions(this.ToyToken.address, ethers.constants.HashZero, conditionId, [indexSetA])
        const sellerToyTokenBalance = await this.ToyToken.balanceOf(this.seller.address)
        expect(sellerToyTokenBalance).to.equal(100)

    })
})