import { ArrowUpRight, File, FilmScript, ListNumbers } from 'phosphor-react'
import { Box, Text } from 'grommet'
import { useEffect, useState } from 'react'

import BaseHeader from './BaseHeader'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import DropButtonListItem from '../../list/DropButtonListItem'
import Proposal from '@cambrian/app/classes/stages/Proposal'
import ProposalStatusBadge from '../../badges/ProposalStatusBadge'
import { ResponsiveButtonProps } from '../../buttons/ResponsiveButton'
import SolverInfoModal from '@cambrian/app/ui/common/modals/SolverInfoModal'
import TemplateInfoModal from '@cambrian/app/ui/common/modals/TemplateInfoModal'
import { cpTheme } from '@cambrian/app/theme/theme'
import { mergeFlexIntoComposition } from '@cambrian/app/utils/helpers/flexInputHelpers'
import useCambrianProfile from '@cambrian/app/hooks/useCambrianProfile'

interface ProposalHeaderProps {
    proposal: Proposal
    showConfiguration?: boolean
    showProposalLink?: boolean
}

const ProposalHeader = ({
    proposal,
    showConfiguration,
    showProposalLink,
}: ProposalHeaderProps) => {
    const [showTemplateInfoModal, setShowTemplateInfoModal] = useState(false)
    const [headerItems, setHeaderItems] = useState<ResponsiveButtonProps[]>([])
    const [proposalAuthor] = useCambrianProfile(proposal.content.author)
    const [composition, setComposition] = useState<CompositionModel>()
    const [showSolverConfigModal, setShowSolverConfigModal] = useState<number>() // Solver index

    useEffect(() => {
        let items: ResponsiveButtonProps[] = []
        items.push({
            label: 'Template Details',
            icon: <File color={cpTheme.global.colors['dark-4']} />,
            onClick: () => setShowTemplateInfoModal(true),
        })

        if (showProposalLink) {
            items.push({
                label: 'Open Proposal',
                icon: <ArrowUpRight color={cpTheme.global.colors['dark-4']} />,
                href: `/solver/${proposal.doc.streamID}`,
            })
        }

        if (showConfiguration) {
            const mergedComposition = mergeFlexIntoComposition(
                mergeFlexIntoComposition(
                    proposal.compositionDoc.content,
                    proposal.template.content.flexInputs
                ),
                proposal.content.flexInputs
            )

            setComposition(mergedComposition)
            items.push({
                label: 'Solver Configurations',
                dropContent: (
                    <Box>
                        {mergedComposition?.solvers.map((solver, idx) => (
                            <DropButtonListItem
                                key={idx}
                                label={
                                    <Box width="medium">
                                        <Text>{solver.solverTag.title}</Text>
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
                                onClick={() => setShowSolverConfigModal(idx)}
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
                icon: <ListNumbers color={cpTheme.global.colors['dark-4']} />,
            })
        }
        setHeaderItems(items)
    }, [])

    const toggleShowTemplateInfoModal = () =>
        setShowTemplateInfoModal(!showTemplateInfoModal)

    return (
        <>
            <BaseHeader
                title={proposal.content.title}
                metaTitle="Proposal"
                items={headerItems}
                authorProfileDoc={proposalAuthor}
                statusBadge={<ProposalStatusBadge status={proposal.status} />}
            />
            {showTemplateInfoModal && (
                <TemplateInfoModal
                    template={proposal.template}
                    onClose={toggleShowTemplateInfoModal}
                />
            )}
            {showSolverConfigModal !== undefined && composition && (
                <SolverInfoModal
                    onClose={() => setShowSolverConfigModal(undefined)}
                    composition={composition}
                    composerSolver={composition.solvers[showSolverConfigModal]}
                    price={{
                        amount: proposal.content.price.amount,
                        token: proposal.collateralToken,
                    }}
                />
            )}
        </>
    )
}

export default ProposalHeader
