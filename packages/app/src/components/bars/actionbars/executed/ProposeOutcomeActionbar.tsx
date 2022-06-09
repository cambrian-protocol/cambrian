import ActionbarItemDropContainer from '../../../containers/ActionbarItemDropContainer'
import BaseActionbar from '@cambrian/app/components/bars/actionbars/BaseActionbar'
import { Button } from 'grommet'
import { GenericMethods } from '../../../solver/Solver'
import ProposeOutcomeModal from '../../../modals/ProposeOutcomeModal'
import { Shield } from 'phosphor-react'
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
            <BaseActionbar
                primaryAction={
                    <Button
                        primary
                        size="small"
                        label="Propose Outcome"
                        onClick={toggleShowProposeOutcomeModal}
                    />
                }
                info={{
                    title: 'Propose an outcome',
                    subTitle:
                        'Select the outcome when solve conditions are met',
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
