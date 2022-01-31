import SolverContract from '@cambrian/app/classes/SolverContract'

import { ethers, deployments } from 'hardhat'
import { expect } from 'chai'
const {
    getBytes32FromMultihash,
} = require('@cambrian/core/helpers/multihash.js')

const ctHelpers = require('@cambrian/core/helpers/ConditionalTokens.js')
const SOLVER_ABI = require('@artifacts/contracts/Solver.sol/Solver.json').abi

describe('Data Update', function () {
    it('Should update SolverContract data after certain events', async function () {
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
            {
                executions: 0,
                ingestType: 3,
                slot: 5,
                solverIndex: 0,
                data: ethers.constants.HashZero,
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

        const solverConfig = {
            implementation: Solver.address,
            keeper: keeper.address,
            arbitrator: arbitrator.address,
            timelockSeconds: 0,
            data: ethers.utils.formatBytes32String(''),
            ingests: ingests0,
            conditionBase: canon0,
        }

        let deployedAddress = await SolverFactory.createSolver(
            ethers.constants.AddressZero,
            0,
            solverConfig
        )
            .then((tx: any) => tx.wait())
            .then(
                (rc: any) =>
                    ethers.utils.defaultAbiCoder.decode(
                        ['address'],
                        rc.events[0].data
                    )[0]
            )

        let solver = new SolverContract(
            deployedAddress,
            SOLVER_ABI,
            ethers.provider
        )

        await solver.updateData()
        expect(solver.data.slots[4].data).to.equal('0x') // Slot hasn't been ingested yet
        expect(solver.data.slots[4].data).to.equal('0x') // Slot hasn't been ingested yet
        await solver.prepareSolve(0).then((tx: any) => tx.wait())

        expect(solver.data.slots[4].data).to.equal(
            '0x0000000000000000000000000000000000000000000000000000000000002710'
        )

        // //Fund Solver
        // await ToyToken.connect(buyer).transfer(solver.address, 100)

        // await solver.executeSolve(0)
        // await solver.updateData()
        // expect(solver.data.slots[5].data).to.equal(1)
    })
})
