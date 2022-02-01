import SolverContract from '@cambrian/app/classes/SolverContract'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { getBytes32FromMultihash } from '@cambrian/app/utils/helpers/multihash'
import React from 'react'
import { ethers } from 'ethers'

const SOLVER_ABI = require('@artifacts/contracts/Solver.sol/Solver.json').abi
const SOLVER_FACTORY_ABI =
    require('@artifacts/contracts/SolverFactory.sol/SolverFactory.json').abi

export default function Solver() {
    const [contractProps, setContractProps] = React.useState({
        address: undefined,
        abi: SOLVER_ABI,
        provider: new ethers.providers.JsonRpcProvider(
            'http://127.0.0.1:8545/'
        ),
    })

    React.useEffect(() => {
        async function initSolver() {
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
            ]

            const canon0 = {
                collateralToken: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
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
                implementation: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
                keeper: '0x67c95F622D910E63DbE237eAFB9fe807fa5D6264',
                arbitrator: '0x67c95F622D910E63DbE237eAFB9fe807fa5D6264',
                timelockSeconds: 0,
                data: ethers.utils.formatBytes32String(''),
                ingests: ingests0,
                conditionBase: canon0,
            }

            const SolverFactory = new ethers.Contract(
                '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
                SOLVER_FACTORY_ABI,
                contractProps.provider.getSigner()
            )

            try {
                let address = await SolverFactory.createSolver(
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

                setContractProps({ ...contractProps, address: address })
            } catch (e) {
                console.log(e)
            }
        }
        initSolver()
    }, [])

    if (contractProps.address) {
        return (
            <>
                <div>HELLO</div>
                <SolverContract {...contractProps} />
            </>
        )
    } else {
        return <>NOPE</>
    }
}
