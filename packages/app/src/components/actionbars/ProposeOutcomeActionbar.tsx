import Actionbar from '@cambrian/app/ui/interaction/bars/Actionbar'
import { BasicSolverMethodsType } from '../solver/Solver'
import { Info } from 'phosphor-react'
import OutcomeCollectionModal from '../modals/OutcomeCollectionModal'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { binaryArrayFromIndexSet } from '@cambrian/app/utils/transformers/SolverConfig'
import { useState } from 'react'

interface ProposeOutcomeActionbarProps {
    solverData: SolverModel
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
        setShowProposeOutcomeModal(false)
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
                        icon: <Info />,
                        descLabel: 'Info',
                        label: 'Propose Outcome when solve conditions are met',
                    },
                }}
            />
            {showProposeOutcomeModal && (
                <OutcomeCollectionModal
                    onBack={toggleShowProposeOutcomeModal}
                    outcomeCollections={
                        solverData.outcomeCollections[
                            currentCondition.conditionId
                        ]
                    }
                    proposeMethod={onProposeOutcome}
                />
            )}
        </>
    )
}

export default ProposeOutcomeActionbar
