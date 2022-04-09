import { useEffect, useState } from 'react'

import AddDataActionbar from './AddDataActionbar'
import ExecuteSolveActionbar from './ExecuteSolveActionbar'
import { GenericMethods } from '../../solver/Solver'
import { RichSlotModel } from '@cambrian/app/models/SlotModel'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'
import { getManualSlots } from '../../solver/SolverHelpers'

interface InitiatedActionbarProps {
    currentUser: UserType
    solverMethods: GenericMethods
    solverData: SolverModel
    solverContract: ethers.Contract
    currentCondition: SolverContractCondition
    updateSolverData: () => Promise<void>
}

const InitiatedActionbar = ({
    currentUser,
    solverData,
    solverMethods,
    solverContract,
    currentCondition,
    updateSolverData,
}: InitiatedActionbarProps) => {
    const [emptyManualSlots, setEmptyManualSlots] = useState<RichSlotModel[]>(
        []
    )

    // Init empty manual slots
    useEffect(() => {
        const fetchedManualSlots = getManualSlots(solverData)
        const filteredEmptyManualSlots = fetchedManualSlots.filter(
            (manualSlot) => {
                const data =
                    solverData.slotsHistory[currentCondition.conditionId][
                        manualSlot.slot.slot
                    ]?.slot.data

                return !data
            }
        )
        setEmptyManualSlots(filteredEmptyManualSlots)
    }, [solverData])

    return (
        <>
            {emptyManualSlots.length === 0 ? (
                <ExecuteSolveActionbar
                    currentUser={currentUser}
                    solverContract={solverContract}
                    solverMethods={solverMethods}
                    currentCondition={currentCondition}
                    updateSolverData={updateSolverData}
                />
            ) : (
                <AddDataActionbar
                    currentUser={currentUser}
                    solverContract={solverContract}
                    solverMethods={solverMethods}
                    updateSolverData={updateSolverData}
                    manualSlots={emptyManualSlots}
                />
            )}
        </>
    )
}

export default InitiatedActionbar
