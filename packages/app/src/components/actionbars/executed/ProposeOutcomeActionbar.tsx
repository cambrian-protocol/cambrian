import Actionbar, {
    ActionbarItemType,
} from '@cambrian/app/ui/interaction/bars/Actionbar'
import { Faders, Info, Question, Shield } from 'phosphor-react'

import ActionbarItemDropContainer from '../../containers/ActionbarItemDropContainer'
import BaseLayerModal from '../../modals/BaseLayerModal'
import { Button } from 'grommet'
import { GenericMethods } from '../../solver/Solver'
import { MetadataModel } from '@cambrian/app/models/MetadataModel'
import ProposalInfoModal from '../../modals/ProposalInfoModal'
import ProposeOutcomeModal from '../../modals/ProposeOutcomeModal'
import SolverConfigInfo from '@cambrian/app/ui/interaction/config/SolverConfigInfo'
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
    const [showProposalInfoModal, setShowProposalInfoModal] = useState(false)
    const toggleShowProposalInfoModal = () =>
        setShowProposalInfoModal(!showProposalInfoModal)

    const [showProposeOutcomeModal, setShowProposeOutcomeModal] =
        useState(false)

    const toggleShowProposeOutcomeModal = () =>
        setShowProposeOutcomeModal(!showProposeOutcomeModal)

    const [showSolverConfigInfoModal, setSolverConfigInfoModal] =
        useState(false)

    const toggleShowSolverConfigInfoModal = () =>
        setSolverConfigInfoModal(!showSolverConfigInfoModal)

    const actionbarItems: ActionbarItemType[] = [
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
        {
            icon: <Faders />,
            onClick: toggleShowSolverConfigInfoModal,
            label: 'Solver',
        },
    ]

    if (metadata) {
        actionbarItems.push({
            icon: <Info />,
            label: 'Gig',
            onClick: toggleShowProposalInfoModal,
        })
    }

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
                actionbarItems={actionbarItems}
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
            {showProposalInfoModal && metadata?.stages && (
                <ProposalInfoModal
                    onClose={toggleShowProposalInfoModal}
                    metadata={metadata}
                />
            )}
            {showSolverConfigInfoModal && (
                <BaseLayerModal onClose={toggleShowSolverConfigInfoModal}>
                    <SolverConfigInfo
                        solverData={solverData}
                        currentCondition={currentCondition}
                    />
                </BaseLayerModal>
            )}
        </>
    )
}

export default ProposeOutcomeActionbar
