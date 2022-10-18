import { ClipboardText, Gear } from 'phosphor-react'

import BaseHeader from './BaseHeader'
import ProposalInfoModal from '@cambrian/app/ui/common/modals/ProposalInfoModal'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import SolverInfoModal from '@cambrian/app/ui/common/modals/SolverInfoModal'
import { SolverMetadataModel } from '@cambrian/app/models/SolverMetadataModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import SolverStatusBadge from '../../badges/SolverStatusBadge'
import { cpTheme } from '@cambrian/app/theme/theme'
import { useState } from 'react'

interface SolverHeaderProps {
    metadata?: SolverMetadataModel
    solverData: SolverModel
    currentCondition: SolverContractCondition
}

const SolverHeader = ({
    metadata,
    solverData,
    currentCondition,
}: SolverHeaderProps) => {
    const [showProposalInfoModal, setShowProposalInfoModal] = useState(false)
    const [showSolverConfigInfoModal, setShowSolverConfigInfoModal] =
        useState(false)

    const toggleShowSolverConfigInfoModal = () =>
        setShowSolverConfigInfoModal(!showSolverConfigInfoModal)

    const toggleShowProposalInfoModal = () =>
        setShowProposalInfoModal(!showProposalInfoModal)

    return (
        <>
            <BaseHeader
                metaTitle="Work Solver"
                title={metadata?.solverTag.title || 'Unnamed Solver'}
                items={[
                    {
                        label: 'Proposal Details',
                        icon: (
                            <ClipboardText
                                color={cpTheme.global.colors['dark-4']}
                            />
                        ),
                        onClick: toggleShowProposalInfoModal,
                    },
                    {
                        label: 'Configuration',
                        icon: <Gear color={cpTheme.global.colors['dark-4']} />,
                        onClick: toggleShowSolverConfigInfoModal,
                    },
                ]}
                statusBadge={
                    <SolverStatusBadge status={currentCondition.status} />
                }
            />
            {showProposalInfoModal && metadata?.stageStack && (
                <ProposalInfoModal
                    collateralToken={solverData.collateralToken}
                    stageStack={metadata?.stageStack}
                    onClose={toggleShowProposalInfoModal}
                />
            )}
            {showSolverConfigInfoModal && (
                <SolverInfoModal
                    contractCondition={currentCondition}
                    contractSolverData={solverData}
                    onClose={toggleShowSolverConfigInfoModal}
                />
            )}
        </>
    )
}

export default SolverHeader
