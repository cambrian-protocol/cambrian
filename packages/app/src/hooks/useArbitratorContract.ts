import { useEffect, useState } from 'react'

import { BASIC_ARBITRATOR_IFACE } from 'packages/app/config/ContractInterfaces'
import { SolverContractCondition } from '../models/ConditionModel'
import { SolverModel } from '../models/SolverModel'
import { UserType } from '../store/UserContext'
import { ethers } from 'ethers'

interface UseArbitratorContractProps {
    solverData: SolverModel
    currentUser: UserType
    currentCondition: SolverContractCondition
    solverAddress: string
}

// Hook to check if the arbitrator address is a contract
const useArbitratorContract = ({
    solverData,
    currentUser,
    currentCondition,
    solverAddress,
}: UseArbitratorContractProps) => {
    const [arbitratorContract, setArbitratorContract] =
        useState<ethers.Contract>()
    const [disputeId, setDisputeId] = useState<string>()

    useEffect(() => {
        async function checkArbitratorIsContract() {
            const arbitratorCode = await currentUser.signer?.provider?.getCode(
                solverData.config.arbitrator
            )
            // TODO Properly check BasicArbitrator Contract Interface
            const isContract = arbitratorCode !== '0x'

            if (isContract) {
                setDisputeId(
                    ethers.utils.keccak256(
                        ethers.utils.defaultAbiCoder.encode(
                            ['address', 'uint256'],
                            [solverAddress, currentCondition.executions - 1]
                        )
                    )
                )

                const contract = new ethers.Contract(
                    solverData.config.arbitrator,
                    BASIC_ARBITRATOR_IFACE,
                    currentUser.signer
                )
                setArbitratorContract(contract)
            }
        }
        checkArbitratorIsContract()
    }, [currentUser])

    return {
        arbitratorContract: arbitratorContract,
        disputeId: disputeId,
    }
}

export default useArbitratorContract
