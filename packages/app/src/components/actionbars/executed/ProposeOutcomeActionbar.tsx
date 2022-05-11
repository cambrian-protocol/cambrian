import Actionbar from '@cambrian/app/ui/interaction/bars/Actionbar'
import { Button } from 'grommet'
import { GenericMethods } from '../../solver/Solver'
import { Info } from 'phosphor-react'
import ProposeOutcomeModal from '../../modals/ProposeOutcomeModal'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { useState } from 'react'

interface ProposeOutcomeActionbarProps {
    solverData: SolverModel
    solverMethods: GenericMethods
    currentCondition: SolverContractCondition
}

const ProposeOutcomeActionbar = ({
    solverData,
    solverMethods,
    currentCondition,
}: ProposeOutcomeActionbarProps) => {
    // To keep track if Keeper is currently in a transaction
    const [proposedIndexSet, setProposedIndexSet] = useState<number>()

    const [showProposeOutcomeModal, setShowProposeOutcomeModal] =
        useState(false)

    const toggleShowProposeOutcomeModal = () =>
        setShowProposeOutcomeModal(!showProposeOutcomeModal)

    return (
        <>
            <Actionbar
                actions={{
                    primaryAction: (
                        <Button
                            primary
                            size="small"
                            label="Propose Outcome"
                            onClick={toggleShowProposeOutcomeModal}
                        />
                    ),
                    info: {
                        icon: <Info />,
                        descLabel: 'Info',
                        label: 'Propose Outcome when solve conditions are met',
                    },
                }}
            />
            {showProposeOutcomeModal && (
                <ProposeOutcomeModal
                    proposedIndexSet={proposedIndexSet}
                    setProposedIndexSet={setProposedIndexSet}
                    currentCondition={currentCondition}
                    solverData={solverData}
                    solverMethods={solverMethods}
                    onBack={toggleShowProposeOutcomeModal}
                />
            )}
        </>
    )
}

export default ProposeOutcomeActionbar
