import { Box, Text } from 'grommet'
import { File, FilmScript, ListNumbers } from 'phosphor-react'
import { useEffect, useState } from 'react'

import BaseHeader from './BaseHeader'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import DropButtonListItem from '../../list/DropButtonListItem'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import ProposalStatusBadge from '../../badges/ProposalStatusBadge'
import { ResponsiveButtonProps } from '../../buttons/ResponsiveButton'
import SolverInfoModal from '@cambrian/app/ui/common/modals/SolverInfoModal'
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
    const [composition, setComposition] = useState<CompositionModel>()
    const [showSolverConfigModal, setShowSolverConfigModal] = useState<number>() // Solver index
    const [onChainProposalId, setOnChainProposalId] = useState<string>()

    useEffect(() => {
        let items: ResponsiveButtonProps[] = []
        if (stageStack) {
            items.push({
                label: 'Template Details',
                icon: <File color={cpTheme.global.colors['dark-4']} />,
                onClick: () => setShowTemplateInfoModal(true),
            })
            if (showConfiguration) {
                const mergedComposition = mergeFlexIntoComposition(
                    mergeFlexIntoComposition(
                        stageStack.composition,
                        stageStack.template.flexInputs
                    ),
                    stageStack.proposal.flexInputs
                )

                setComposition(mergedComposition)
                items.push({
                    label: 'Solver Configurations',
                    dropContent: (
                        <Box>
                            {mergedComposition?.solvers.map((solver, idx) => (
                                <DropButtonListItem
                                    label={
                                        <Box width="medium">
                                            <Text>
                                                {solver.solverTag.title}
                                            </Text>
                                            <Text
                                                size="xsmall"
                                                color="dark-4"
                                                truncate
                                            >
                                                {solver.solverTag.description}
                                            </Text>
                                        </Box>
                                    }
                                    icon={<FilmScript />}
                                    onClick={() =>
                                        setShowSolverConfigModal(idx)
                                    }
                                />
                            ))}
                        </Box>
                    ),
                    dropAlign: {
                        top: 'bottom',
                        right: 'right',
                    },
                    dropProps: {
                        round: {
                            corner: 'bottom',
                            size: 'xsmall',
                        },
                    },
                    icon: (
                        <ListNumbers color={cpTheme.global.colors['dark-4']} />
                    ),
                })
            }
            setHeaderItems(items)
        }
    }, [stageStack])

    useEffect(() => {
        if (stageStack) {
            setOnChainProposalId(
                getOnChainProposalId(
                    stageStack.proposalCommitID,
                    stageStack.proposal.template.commitID
                )
            )
        }
    }, [proposalStatus])

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
                            onChainProposalId={onChainProposalId}
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
            {showSolverConfigModal !== undefined && composition && (
                <SolverInfoModal
                    onClose={() => setShowSolverConfigModal(undefined)}
                    composition={composition}
                    composerSolver={composition.solvers[showSolverConfigModal]}
                    price={{
                        amount: stageStack.proposal.price.amount,
                        token: collateralToken,
                    }}
                />
            )}
        </>
    )
}

export default ProposalHeader
