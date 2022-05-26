import Actionbar, {
    ActionbarItemType,
} from '@cambrian/app/ui/interaction/bars/Actionbar'
import { Faders, Info, Question, Scales } from 'phosphor-react'

import ActionbarItemDropContainer from '../../containers/ActionbarItemDropContainer'
import BaseLayerModal from '../../modals/BaseLayerModal'
import { MetadataModel } from '@cambrian/app/models/MetadataModel'
import ProposalInfoModal from '../../modals/ProposalInfoModal'
import SolverConfigInfo from '@cambrian/app/ui/interaction/config/SolverConfigInfo'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { useState } from 'react'

interface LockedByArbitrationActionbarProps {
    metadata?: MetadataModel
    solverData: SolverModel
    currentCondition: SolverContractCondition
}

const LockedByArbitrationActionbar = ({
    solverData,
    metadata,
    currentCondition,
}: LockedByArbitrationActionbarProps) => {
    const [showSolverConfigInfoModal, setSolverConfigInfoModal] =
        useState(false)
    const [showProposalInfoModal, setShowProposalInfoModal] = useState(false)
    const toggleShowProposalInfoModal = () =>
        setShowProposalInfoModal(!showProposalInfoModal)
    const toggleShowSolverConfigInfoModal = () =>
        setSolverConfigInfoModal(!showSolverConfigInfoModal)

    const actionbarItems: ActionbarItemType[] = [
        {
            icon: <Question />,
            dropContent: (
                <ActionbarItemDropContainer
                    title="Arbitration in Progress"
                    description="Somebody has disagreed with the proposed outcome and raised a dispute"
                    list={[
                        {
                            icon: <Scales />,
                            label: 'Please reach out to the Arbitrator for more Information',
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
            <Actionbar actionbarItems={actionbarItems} />
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

export default LockedByArbitrationActionbar
