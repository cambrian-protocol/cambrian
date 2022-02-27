import {
    SolverContractCondition,
    SolverContractData,
} from '@cambrian/app/models/SolverModel'

import Actionbar from '@cambrian/app/ui/interaction/bars/Actionbar'
import { BasicSolverMethodsType } from '../solver/Solver'
import OutcomeCollectionModal from '../modals/OutcomeCollectionModal'
import { binaryArrayFromIndexSet } from '@cambrian/app/utils/transformers/SolverConfig'
import { useState } from 'react'
import { WarningCircle } from 'phosphor-react'

interface ProposeOutcomeActionbarProps {
    solverData: SolverContractData
    solverMethods: BasicSolverMethodsType
    currentCondition: SolverContractCondition
}

const ProposeOutcomeActionbar = ({
    solverData,
    solverMethods,
    currentCondition,
}: ProposeOutcomeActionbarProps) => {
    const [showProposeOutcomeModal, setShowProposeOutcomeModal] =
        useState(false)

    const toggleShowProposeOutcomeModal = () =>
        setShowProposeOutcomeModal(!showProposeOutcomeModal)

    const onProposeOutcome = (indexSet: number) => {
        const binaryArray = binaryArrayFromIndexSet(
            indexSet,
            solverData.config.conditionBase.outcomeSlots
        )
        solverMethods.proposePayouts(
            currentCondition.executions - 1,
            binaryArray
        )
    }

    return (
        <>
            <Actionbar
                actions={{
                    primaryAction: {
                        onClick: toggleShowProposeOutcomeModal,
                        label: 'Propose Outcome',
                    },
                    info: {
                        icon: <WarningCircle />,
                        descLabel: 'Info',
                        label: 'Propose Outcome when solve conditions are met',
                    },
                }}
            />
            {showProposeOutcomeModal && (
                <OutcomeCollectionModal
                    onBack={toggleShowProposeOutcomeModal}
                    allocations={
                        solverData.allocationsHistory[
                            currentCondition.conditionId
                        ]
                    }
                    outcomeCollections={solverData.outcomeCollections}
                    proposeMethod={onProposeOutcome}
                />
            )}
        </>
    )
}

export default ProposeOutcomeActionbar
