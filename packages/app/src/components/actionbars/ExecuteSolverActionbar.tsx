import AddDataModal, { ManualInputsFormType } from '../modals/AddDataModal'
import {
    SolverContractCondition,
    SolverContractData,
} from '@cambrian/app/models/SolverModel'
import { useEffect, useState } from 'react'

import Actionbar from '@cambrian/app/ui/interaction/bars/Actionbar'
import { BasicSolverMethodsType } from '../solver/Solver'
import { ParsedSlotModel } from '@cambrian/app/models/SlotModel'
import { WarningCircle } from 'phosphor-react'
import { ethers } from 'ethers'

interface ExecuteSolverActionbarProps {
    solverMethods: BasicSolverMethodsType
    solverData: SolverContractData
    currentCondition?: SolverContractCondition
    manualSlots: ParsedSlotModel[]
}

const ExecuteSolverActionbar = ({
    solverMethods,
    solverData,
    currentCondition,
    manualSlots,
}: ExecuteSolverActionbarProps) => {
    const [showAddDataModal, setShowAddDataModal] = useState(false)
    const [hasAllManualFields, setHasAllManualFields] = useState(false)
    const toggleShowAddDataModal = () => setShowAddDataModal(!showAddDataModal)

    useEffect(() => {
        if (currentCondition !== undefined) {
            let allManualFieldsFilled = true
            manualSlots.forEach((field) => {
                const data =
                    solverData.slotsHistory[currentCondition.conditionId][
                        field.slot
                    ]?.data
                if (!data) {
                    allManualFieldsFilled = false
                }
            })
            setHasAllManualFields(allManualFieldsFilled)
        }
    }, [])

    const onExecuteSolve = async () => {
        const conditionIndex =
            currentCondition === undefined ? 0 : currentCondition.executions - 1
        await solverMethods.executeSolve(conditionIndex)
    }

    const onAddData = async (manualInputs: ManualInputsFormType) => {
        if (currentCondition === undefined) {
            await solverMethods.prepareSolve(0)
        }
        manualInputs.manualInputs.forEach(async (manualInput) => {
            // TODO Encode the right type (tags)
            const encodedData = ethers.utils.defaultAbiCoder.encode(
                ['address'],
                [manualInput.input]
            )
            await solverMethods.addData(manualInput.slot.slot, encodedData)
        })
        toggleShowAddDataModal()
    }

    return (
        <>
            {hasAllManualFields ? (
                <Actionbar
                    actions={{
                        primaryAction: {
                            label: 'Execute Solver',
                            onClick: onExecuteSolve,
                        },
                    }}
                />
            ) : (
                <Actionbar
                    actions={{
                        primaryAction: {
                            label: 'Prepare Solver',
                            onClick: toggleShowAddDataModal,
                        },
                        info: {
                            icon: <WarningCircle />,
                            descLabel: 'Info',
                            label: 'Please prepare the solver',
                        },
                    }}
                />
            )}
            {showAddDataModal && (
                <AddDataModal
                    manualSlots={manualSlots}
                    onBack={toggleShowAddDataModal}
                    onAddData={onAddData}
                />
            )}
        </>
    )
}

export default ExecuteSolverActionbar
