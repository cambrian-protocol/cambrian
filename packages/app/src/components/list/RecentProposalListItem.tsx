import { Article, UserCircle } from 'phosphor-react'
import { Box, Text } from 'grommet'

import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import Link from 'next/link'
import { cpTheme } from '@cambrian/app/theme/theme'
import useCambrianProfile from '@cambrian/app/hooks/useCambrianProfile'

interface RecentProposalListItemProps {
    proposal: CeramicProposalModel
    proposalStreamID: string
}

const RecentProposalListItem = ({
    proposal,
    proposalStreamID,
}: RecentProposalListItemProps) => {
    const [proposalAuthor] = useCambrianProfile(proposal.author)

    return (
        <Link
            href={`${window.location.origin}/proposals/${proposalStreamID}`}
            passHref
        >
            <Box
                focusIndicator={false}
                border
                round="xsmall"
                pad={{ horizontal: 'medium', vertical: 'small' }}
                gap="xsmall"
            >
                <Box direction="row" gap="small">
                    <Article size="24" />
                    <Text>{proposal.title}</Text>
                </Box>
                <Box direction="row" gap="medium">
                    <Box direction="row" gap="small" align="center">
                        <UserCircle
                            size="18"
                            color={cpTheme.global.colors['dark-4']}
                        />
                        <Text size="small" color="dark-4">
                            Author: {proposalAuthor?.content.name || 'Anon'}
                        </Text>
                    </Box>
                </Box>
            </Box>
        </Link>
    )
}

export default RecentProposalListItem
