import { ClipboardText, File } from 'phosphor-react'
import { useEffect, useState } from 'react'

import BaseHeader from './BaseHeader'
import ProposalInfoModal from '@cambrian/app/ui/common/modals/ProposalInfoModal'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import ProposalStatusBadge from '../../badges/ProposalStatusBadge'
import { ResponsiveButtonProps } from '../../buttons/ResponsiveButton'
import { StageStackType } from '@cambrian/app/ui/dashboard/ProposalsDashboardUI'
import TemplateInfoModal from '@cambrian/app/ui/common/modals/TemplateInfoModal'
import { cpTheme } from '@cambrian/app/theme/theme'
import useCambrianProfile from '@cambrian/app/hooks/useCambrianProfile'

interface ProposalHeaderProps {
    stageStack?: StageStackType
    proposalStatus?: ProposalStatus
    showProposalDetails?: boolean
}

const ProposalHeader = ({
    stageStack,
    proposalStatus,
    showProposalDetails,
}: ProposalHeaderProps) => {
    const [showTemplateInfoModal, setShowTemplateInfoModal] = useState(false)
    const [showProposalInfoModal, setShowProposalInfoModal] = useState(false)
    const [headerItems, setHeaderItems] = useState<ResponsiveButtonProps[]>([])
    const [proposalAuthor] = useCambrianProfile(stageStack?.proposal.author)

    useEffect(() => {
        let items: ResponsiveButtonProps[] = []
        if (stageStack) {
            items.push({
                label: 'Template Details',
                icon: <File color={cpTheme.global.colors['dark-4']} />,
                onClick: toggleShowTemplateInfoModal,
            })
            if (showProposalDetails) {
                items.push({
                    label: 'Proposal Details',
                    icon: (
                        <ClipboardText
                            color={cpTheme.global.colors['dark-4']}
                        />
                    ),
                    onClick: toggleShowProposalInfoModal,
                })
            }
        }
        setHeaderItems(items)
    }, [])

    const toggleShowProposalInfoModal = () =>
        setShowProposalInfoModal(!showProposalInfoModal)

    const toggleShowTemplateInfoModal = () =>
        setShowTemplateInfoModal(!showTemplateInfoModal)

    return (
        <>
            <BaseHeader
                title={stageStack?.proposal.title || 'Untitled Proposal'}
                metaTitle="Proposal"
                items={headerItems}
                authorProfileDoc={proposalAuthor}
                statusBadge={<ProposalStatusBadge status={proposalStatus} />}
            />
            {showTemplateInfoModal && stageStack && (
                <TemplateInfoModal
                    stageStack={stageStack}
                    onClose={toggleShowTemplateInfoModal}
                />
            )}
            {showProposalInfoModal && stageStack && (
                <ProposalInfoModal
                    stageStack={stageStack}
                    onClose={toggleShowProposalInfoModal}
                />
            )}
        </>
    )
}

export default ProposalHeader
