const { ethers } = require("hardhat")
const { expect } = require("chai")

describe("BinaryConditions contract", function() {

    this.beforeEach(async function() {
        const [avatar, buyer, seller, oracle, jv] = await ethers.getSigners();
        this.buyer = buyer;
        this.seller = seller;
        this.oracle = oracle;
        this.avatar = avatar;
        this.jv = jv;


        this.ToyTokenFactory = await ethers.getContractFactory("ToyToken")
        this.ToyToken = await this.ToyTokenFactory.deploy("TOY1", "T1")
        await this.ToyToken.mint(this.avatar.address, '100')

        this.CTFactory = await ethers.getContractFactory("ConditionalTokens")
        this.CT = await this.CTFactory.deploy()

        this.SolverFactory = await ethers.getContractFactory("BinaryCondition")
        this.Solver = await this.SolverFactory.deploy()
        await this.Solver.initialize(this.avatar.address, this.CT.address, 10) // 10& = fee
        await this.Solver.setOracle(this.oracle.address)

    })


    it("Should prepare, split, report and redeem a binary condition", async function() {
        const questionId = ethers.utils.formatBytes32String("Test")
            // /**
            //  * @dev
            //  * @param _oracle              The account assigned to report the result for the prepared condition.
            //  * @param _questionId          An identifier for the question to be answered by the oracle.
            //  * @param _parentCollectionId  The ID of the outcome collections common to the position being split and
            //  *                             the split target positions. May be null, in which only the collateral is shared.
            //  * @param _collateralToken     The address of the positions' backing collateral token.
            //  */
        await this.Solver.createBinaryCondition(this.oracle.address, questionId, ethers.utils.formatBytes32String(""), this.ToyToken.address)

        await this.ToyToken.connect(this.avatar).approve(this.Solver.address, 40)
            // /**
            //  * @dev
            //  * @param _oracle              The account assigned to report the result for the prepared condition.
            //  * @param _questionId          An identifier for the question to be answered by the oracle.
            //  * @param _parentCollectionId  The ID of the outcome collections common to the position being split and
            //  *                             the split target positions. May be null, in which only the collateral is shared.
            //  * @param _collateralToken     The address of the positions' backing collateral token.
            //  * @param _amount              The amount of collateral or stake to split.
            //  * @param _jv                  The address of the joint venture wallet.
            //  */
        await this.Solver.splitBinaryCondition(this.oracle.address, questionId, ethers.utils.formatBytes32String(""), this.ToyToken.address, 40, this.jv.address)
        
        // report success
        await this.CT.connect(this.oracle).reportPayouts(questionId, [0,1])

        // redeem positions
        let conditionId = await this.CT.getConditionId(this.oracle.address, questionId, 2);

        await this.Solver.connect(this.oracle).redeemPositions(this.ToyToken.address, ethers.utils.formatBytes32String(""), conditionId, 1, this.buyer.address, this.jv.address, 40)

        // CT contract has Buyer's 100 toy token collateral
        const toyJVBalance = await this.ToyToken.balanceOf(this.jv.address)
        expect(toyJVBalance).to.equal(36)
    })
})