import AddDataModal, {
    ManualInputsFormType,
    ManualInputType,
} from '../modals/AddDataModal'
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
    }, [solverData, currentCondition, manualSlots])

    const onExecuteSolve = async () => {
        const conditionIndex =
            currentCondition === undefined ? 0 : currentCondition.executions - 1
        await solverMethods.executeSolve(conditionIndex)
    }

    const onAddData = async (input: ManualInputType) => {
        if (currentCondition === undefined) {
            await solverMethods.prepareSolve(0)
        }
        // TODO Encode the right type (tags)
        const encodedData = ethers.utils.defaultAbiCoder.encode(
            ['address'],
            [input.data]
        )
        await solverMethods.addData(input.slot.slot, encodedData)
        toggleShowAddDataModal()
    }

    if (currentCondition === undefined) {
        return (
            <Actionbar
                actions={{
                    primaryAction: {
                        label: 'Prepare Solve',
                        onClick: () => solverMethods.prepareSolve(0),
                    },
                    info: {
                        icon: <WarningCircle />,
                        descLabel: 'Info',
                        label: 'Click Prepare Solve to continue.',
                    },
                }}
            />
        )
    }
    return (
        <>
            {hasAllManualFields ? (
                <Actionbar
                    actions={{
                        primaryAction: {
                            label: 'Execute Solve',
                            onClick: onExecuteSolve,
                        },
                        info: {
                            icon: <WarningCircle />,
                            descLabel: 'Info',
                            label: 'Solve is ready to execute',
                        },
                    }}
                />
            ) : (
                <Actionbar
                    actions={{
                        primaryAction: {
                            label: 'Add Data',
                            onClick: toggleShowAddDataModal,
                        },
                        info: {
                            icon: <WarningCircle />,
                            descLabel: 'Info',
                            label: 'Additional data required',
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
