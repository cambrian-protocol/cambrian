import { useEffect, useState } from 'react'

import { Box } from 'grommet'
import { DisputeModel } from '@cambrian/app/models/DisputeModel'
import DisputerListItem from './DisputerListItem'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { ethers } from 'ethers'
import { getSolverRecipientAddressHashmap } from '@cambrian/app/components/solver/SolverHelpers'

interface DisputerListComponentProps {
    arbitratorContract: ethers.Contract
    disputeId: string
    solverData: SolverModel
    currentCondition: SolverContractCondition
}

const DisputerListComponent = ({
    arbitratorContract,
    disputeId,
    solverData,
    currentCondition,
}: DisputerListComponentProps) => {
    const [dispute, setDispute] = useState<DisputeModel>()

    const recipientsHashmap = getSolverRecipientAddressHashmap(
        solverData,
        currentCondition
    )

    // TODO useEffect dependecy, contract listener setup to get notified of new disputes
    useEffect(() => {
        fetchDispute()
    }, [])

    const fetchDispute = async () => {
        setDispute(await arbitratorContract.getDispute(disputeId))
    }
    return (
        <Box gap="medium">
            {dispute &&
                dispute.disputers.map((disputer, idx) => {
                    if (disputer !== solverData.config.keeper) {
                        return (
                            <DisputerListItem
                                key={idx}
                                address={disputer}
                                recipient={recipientsHashmap[disputer]}
                                choice={dispute.choices[idx]}
                                solverData={solverData}
                                currentCondition={currentCondition}
                            />
                        )
                    }
                })}
        </Box>
    )
}

export default DisputerListComponent
