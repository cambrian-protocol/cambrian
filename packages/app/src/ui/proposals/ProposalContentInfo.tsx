import { Box, Heading, Text } from 'grommet'

import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'

interface ProposalContentInfoProps {
    proposal: CeramicProposalModel
    hideTitle?: boolean
}

const ProposalContentInfo = ({
    proposal,
    hideTitle,
}: ProposalContentInfoProps) => {
    return (
        <Box gap="medium">
            {!hideTitle && <Heading level="2">{proposal.title}</Heading>}
            <Text color="dark-4" style={{ whiteSpace: 'pre-line' }}>
                {proposal.description}
            </Text>
        </Box>
    )
}

export default ProposalContentInfo
