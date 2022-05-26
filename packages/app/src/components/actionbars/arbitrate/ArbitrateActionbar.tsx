import Actionbar, {
    ActionbarItemType,
} from '@cambrian/app/ui/interaction/bars/Actionbar'
import { Faders, Info, Question, Scales } from 'phosphor-react'

import ActionbarItemDropContainer from '../../containers/ActionbarItemDropContainer'
import ArbitrateModal from '../../modals/ArbitrateModal'
import { GenericMethods } from '../../solver/Solver'
import LoaderButton from '../../buttons/LoaderButton'
import { MetadataModel } from '@cambrian/app/models/MetadataModel'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { useState } from 'react'

interface ArbitrateActionbarProps {
    solverData: SolverModel
    solverMethods: GenericMethods
    currentCondition: SolverContractCondition
    metadata?: MetadataModel
}

const ArbitrateActionbar = ({
    solverData,
    solverMethods,
    currentCondition,
    metadata,
}: ArbitrateActionbarProps) => {
    const [showArbitrateModal, setShowArbitrateModal] = useState(false)

    const toggleShowArbitrateModal = () =>
        setShowArbitrateModal(!showArbitrateModal)

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
            <Actionbar
                primaryAction={
                    <LoaderButton
                        isLoading={false}
                        label="Report Outcome"
                        onClick={toggleShowArbitrateModal}
                        primary
                    />
                }
                actionbarItems={actionbarItems}
            />
            {showArbitrateModal && (
                <ArbitrateModal
                    onBack={toggleShowArbitrateModal}
                    currentCondition={currentCondition}
                    solverData={solverData}
                    solverMethods={solverMethods}
                />
            )}
        </>
    )
}

export default ArbitrateActionbar
