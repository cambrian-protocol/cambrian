import SolverContract from '@cambrian/app/classes/SolverContract'

const { ethers, deployments } = require('hardhat')
const { expect } = require('chai')
const {
    getBytes32FromMultihash,
} = require('@cambrian/core/helpers/multihash.js')

const ctHelpers = require('@cambrian/core/helpers/ConditionalTokens.js')
const SOLVER_ABI = require('@artifacts/contracts/Solver.sol/Solver.json').abi

describe('Solver', function () {
    it('Should execute single-solver Proposal with two outcomes', async function () {
        await deployments.fixture([
            'ConditionalTokens',
            'SolverFactory',
            'SolutionsHub',
            'ProposalsHub',
            'ToyToken',
            'BasicSolverV1',
            'IPFSSolutionsHub',
        ])

        const [buyer, seller, keeper, arbitrator] = await ethers.getSigners()
        const CT = await ethers.getContract('ConditionalTokens')
        const SolverFactory = await ethers.getContract('SolverFactory')
        const Solver = await ethers.getContract('BasicSolverV1')
        const ToyToken = await ethers.getContract('ToyToken')
        await ToyToken.mint(buyer.address, '100')

        const ingests0 = [
            {
                executions: 0,
                ingestType: 1,
                slot: 0,
                solverIndex: 0,
                data: ethers.utils.defaultAbiCoder.encode(
                    ['bytes32'],
                    [ethers.utils.formatBytes32String('')]
                ),
            },
            {
                executions: 0,
                ingestType: 1,
                slot: 1,
                solverIndex: 0,
                data: ethers.utils.defaultAbiCoder.encode(
                    ['address'],
                    [buyer.address]
                ),
            },
            {
                executions: 0,
                ingestType: 1,
                slot: 2,
                solverIndex: 0,
                data: ethers.utils.defaultAbiCoder.encode(
                    ['address'],
                    [seller.address]
                ),
            },
            {
                executions: 0,
                ingestType: 1,
                slot: 3,
                solverIndex: 0,
                data: ethers.utils.defaultAbiCoder.encode(['uint256'], [0]),
            },
            {
                executions: 0,
                ingestType: 1,
                slot: 4,
                solverIndex: 0,
                data: ethers.utils.defaultAbiCoder.encode(['uint256'], [10000]),
            },
        ]

        const canon0 = {
            collateralToken: ToyToken.address,
            outcomeSlots: 2,
            parentCollectionIndexSet: 0,
            amountSlot: 4,
            partition: [1, 2],
            allocations: [
                { recipientAddressSlot: 1, recipientAmountSlots: [3, 4] },
                { recipientAddressSlot: 2, recipientAmountSlots: [4, 3] },
            ],
            outcomeURIs: [
                getBytes32FromMultihash(
                    'QmYZB6LDtGqqfJyhJDEp7rgFgEVSm7H7yyXZjhvCqVkYvZ'
                ),
                getBytes32FromMultihash(
                    'QmPrcQH4akfr7eSn4tQHmmudLdJpKhHskVJ5iqYxCks1FP'
                ),
            ],
        }

        const solverConfigs = [
            [
                Solver.address,
                keeper.address,
                arbitrator.address,
                0,
                ethers.utils.formatBytes32String(''),
                ingests0,
                canon0,
            ],
        ]

        let deployedAddress = await SolverFactory.createSolver(
            ethers.constants.AddressZero,
            0,
            solverConfigs[0]
        )
            .then((tx: any) => tx.wait())
            .then(
                (rc: any) =>
                    ethers.utils.defaultAbiCoder.decode(
                        ['address'],
                        rc.events[0].data
                    )[0]
            )

        // Deploy solverChain
        let solver = new SolverContract(
            deployedAddress,
            SOLVER_ABI,
            ethers.provider
        )
        await solver.prepareSolve(0)
        await solver.updateData()

        const parent = await solver.getChainParent()
        console.log(parent)
        //Fund Solver
        await ToyToken.connect(buyer).transfer(solver.address, 100)
        await solver.executeSolve(0)

        // Seller should have all the success tokens
        const indexSetSuccess = ctHelpers.getIndexSetFromBinaryArray([1, 0]) // If success
        const indexSetFailure = ctHelpers.getIndexSetFromBinaryArray([0, 1]) // If failure

        // Keeper proposes payouts
        await solver.proposePayouts(0, [1, 0])

        const conditions = await solver.getConditions()
        const payouts = conditions[0].payouts
        expect(payouts[0]).to.equal(1)
        expect(payouts[1]).to.equal(0)

        // We set timelock to 0, so confirm right away
        await solver.confirmPayouts(0)

        // Seller redeems tokens
        await CT.connect(seller).redeemPositions(
            ToyToken.address,
            ethers.constants.HashZero,
            conditions[conditions.length - 1].conditionId,
            [indexSetSuccess, indexSetFailure]
        )
        const sellerERC20Balance = await ToyToken.balanceOf(seller.address)
        expect(sellerERC20Balance).to.equal(100)
    })
})
