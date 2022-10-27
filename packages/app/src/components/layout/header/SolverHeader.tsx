import { ClipboardText, Gear } from 'phosphor-react'
import { useEffect, useState } from 'react'

import BaseHeader from './BaseHeader'
import ProposalInfoModal from '@cambrian/app/ui/common/modals/ProposalInfoModal'
import { ResponsiveButtonProps } from '../../buttons/ResponsiveButton'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import SolverInfoModal from '@cambrian/app/ui/common/modals/SolverInfoModal'
import { SolverMetadataModel } from '@cambrian/app/models/SolverMetadataModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import SolverStatusBadge from '../../badges/SolverStatusBadge'
import { cpTheme } from '@cambrian/app/theme/theme'

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
    const toggleShowSolverConfigInfoModal = () =>
        setShowSolverConfigInfoModal(!showSolverConfigInfoModal)

    const toggleShowProposalInfoModal = () =>
        setShowProposalInfoModal(!showProposalInfoModal)
    const [showSolverConfigInfoModal, setShowSolverConfigInfoModal] =
        useState(false)
    const [headerItems, setHeaderItems] = useState<ResponsiveButtonProps[]>([
        {
            label: 'Configuration',
            icon: <Gear color={cpTheme.global.colors['dark-4']} />,
            onClick: toggleShowSolverConfigInfoModal,
        },
    ])

    useEffect(() => {
        if (metadata) {
            const updatedHeaderItems = [...headerItems]
            updatedHeaderItems.unshift({
                label: 'Proposal Details',
                icon: <ClipboardText color={cpTheme.global.colors['dark-4']} />,
                onClick: toggleShowProposalInfoModal,
            })
            setHeaderItems(updatedHeaderItems)
        }
    }, [metadata])

    return (
        <>
            <BaseHeader
                metaTitle="Work Solver"
                title={metadata?.solverTag.title || 'Unnamed Solver'}
                items={headerItems}
                statusBadge={
                    <SolverStatusBadge status={currentCondition.status} />
                }
            />
            {showProposalInfoModal && metadata?.stageStack && (
                <ProposalInfoModal
                    collateralToken={solverData.collateralToken}
                    stageStack={metadata.stageStack}
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
