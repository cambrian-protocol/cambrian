import { useEffect, useState } from 'react'

import { DisputeModel } from '@cambrian/app/models/DisputeModel'
import DisputerListItem from './DisputerListItem'
import SidebarComponentContainer from '../../components/containers/SidebarComponentContainer'
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

    // Reusing the ChangedStatus Event from Solver.tsx which updates solverData. Smart Contract is implemented that every time somebody requests arbitration it emits the ChangedStatus Event.
    useEffect(() => {
        fetchDispute()
    }, [solverData])

    const fetchDispute = async () => {
        setDispute(await arbitratorContract.getDispute(disputeId))
    }
    return (
        <SidebarComponentContainer title="Disputer Choices">
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
        </SidebarComponentContainer>
    )
}

export default DisputerListComponent
