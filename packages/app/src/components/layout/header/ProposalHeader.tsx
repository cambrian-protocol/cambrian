import { File, Gear } from 'phosphor-react'
import { useEffect, useState } from 'react'

import BaseHeader from './BaseHeader'
import CompositionInfoModal from '@cambrian/app/ui/common/modals/CompositionInfoModal'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import ProposalStatusBadge from '../../badges/ProposalStatusBadge'
import { ResponsiveButtonProps } from '../../buttons/ResponsiveButton'
import { StageStackType } from '@cambrian/app/ui/dashboard/ProposalsDashboardUI'
import TemplateInfoModal from '@cambrian/app/ui/common/modals/TemplateInfoModal'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { cpTheme } from '@cambrian/app/theme/theme'
import { getOnChainProposalId } from '@cambrian/app/utils/helpers/proposalHelper'
import { mergeFlexIntoComposition } from '@cambrian/app/utils/helpers/flexInputHelpers'
import useCambrianProfile from '@cambrian/app/hooks/useCambrianProfile'

interface ProposalHeaderProps {
    stageStack: StageStackType
    proposalStatus?: ProposalStatus
    collateralToken?: TokenModel
    showConfiguration?: boolean
}

const ProposalHeader = ({
    stageStack,
    proposalStatus,
    showConfiguration,
    collateralToken,
}: ProposalHeaderProps) => {
    const [showTemplateInfoModal, setShowTemplateInfoModal] = useState(false)
    const [headerItems, setHeaderItems] = useState<ResponsiveButtonProps[]>([])
    const [proposalAuthor] = useCambrianProfile(stageStack?.proposal.author)
    const [mergedComposition, setMergedComposition] =
        useState<CompositionModel>()
    const [showSolverInfoModal, setShowSolverInfoModal] = useState(false)

    useEffect(() => {
        let items: ResponsiveButtonProps[] = []
        if (stageStack) {
            items.push({
                label: 'Template Details',
                icon: <File color={cpTheme.global.colors['dark-4']} />,
                onClick: () => setShowTemplateInfoModal(true),
            })
            if (showConfiguration) {
                setMergedComposition(
                    mergeFlexIntoComposition(
                        mergeFlexIntoComposition(
                            stageStack.composition,
                            stageStack.template.flexInputs
                        ),
                        stageStack.proposal.flexInputs
                    )
                )
                items.push({
                    label: 'Configuration',
                    icon: <Gear color={cpTheme.global.colors['dark-4']} />,
                    onClick: () => setShowSolverInfoModal(true),
                })
            }
            setHeaderItems(items)
        }
    }, [stageStack])

    const toggleShowSolverInfoModal = () =>
        setShowSolverInfoModal(!showSolverInfoModal)
    const toggleShowTemplateInfoModal = () =>
        setShowTemplateInfoModal(!showTemplateInfoModal)

    return (
        <>
            <BaseHeader
                title={stageStack?.proposal.title || 'Untitled Proposal'}
                metaTitle="Proposal Solver"
                items={headerItems}
                authorProfileDoc={proposalAuthor}
                statusBadge={
                    proposalStatus ? (
                        <ProposalStatusBadge
                            status={proposalStatus}
                            onChainProposalId={getOnChainProposalId(
                                stageStack?.proposalCommitID || '',
                                stageStack?.proposal.template.commitID || ''
                            )}
                        />
                    ) : undefined
                }
            />
            {showTemplateInfoModal && stageStack && (
                <TemplateInfoModal
                    stageStack={stageStack}
                    onClose={toggleShowTemplateInfoModal}
                />
            )}
            {showSolverInfoModal && mergedComposition && (
                <CompositionInfoModal
                    price={{
                        amount: stageStack.proposal.price.amount,
                        token: collateralToken,
                    }}
                    composition={mergedComposition}
                    onClose={toggleShowSolverInfoModal}
                />
            )}
        </>
    )
}

export default ProposalHeader
