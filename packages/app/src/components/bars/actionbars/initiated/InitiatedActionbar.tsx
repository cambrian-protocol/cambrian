import { useEffect, useState } from 'react'

import AddDataActionbar from './AddDataActionbar'
import ExecuteSolveActionbar from './ExecuteSolveActionbar'
import { GenericMethods } from '../../../solver/Solver'
import { RichSlotModel } from '@cambrian/app/models/SlotModel'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { getManualSlots } from '@cambrian/app/utils/helpers/solverHelpers'

interface InitiatedActionbarProps {
    solverMethods: GenericMethods
    solverData: SolverModel
    currentCondition: SolverContractCondition
    messenger?: JSX.Element
}

const InitiatedActionbar = ({
    solverData,
    solverMethods,
    currentCondition,
    messenger,
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
                    messenger={messenger}
                    solverMethods={solverMethods}
                    currentCondition={currentCondition}
                />
            ) : (
                <AddDataActionbar
                    messenger={messenger}
                    solverMethods={solverMethods}
                    manualSlots={emptyManualSlots}
                />
            )}
        </>
    )
}

export default InitiatedActionbar
