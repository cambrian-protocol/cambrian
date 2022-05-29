import { Question, Shield } from 'phosphor-react'

import Actionbar from '@cambrian/app/ui/interaction/bars/Actionbar'
import ActionbarItemDropContainer from '../../containers/ActionbarItemDropContainer'
import { Button } from 'grommet'
import { GenericMethods } from '../../solver/Solver'
import { MetadataModel } from '@cambrian/app/models/MetadataModel'
import ProposeOutcomeModal from '../../modals/ProposeOutcomeModal'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { useState } from 'react'

interface ProposeOutcomeActionbarProps {
    solverData: SolverModel
    solverMethods: GenericMethods
    currentCondition: SolverContractCondition
    metadata?: MetadataModel
}

const ProposeOutcomeActionbar = ({
    solverData,
    solverMethods,
    currentCondition,
    metadata,
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
                primaryAction={
                    <Button
                        primary
                        size="small"
                        label="Propose Outcome"
                        onClick={toggleShowProposeOutcomeModal}
                    />
                }
                actionbarItems={[
                    {
                        icon: <Question />,
                        dropContent: (
                            <ActionbarItemDropContainer
                                title="Propose an outcome"
                                description='Please hit the "Propose Outcome"-Button at your right, select the outcome when solve conditions are met and confirm the transaction.'
                                list={[
                                    {
                                        icon: <Shield />,
                                        label: 'This must be done by the Keeper',
                                    },
                                ]}
                            />
                        ),
                        label: 'Help',
                    },
                ]}
                metadata={metadata}
                solverData={solverData}
                currentCondition={currentCondition}
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
