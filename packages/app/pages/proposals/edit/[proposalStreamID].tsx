import { Box, Heading } from 'grommet'

import DashboardLayout from '@cambrian/app/components/layout/DashboardLayout'

// TODO Page to edit a proposal Draft which has not been deployed on chain yet.
export default function ProposalDraftPage() {
    return (
        <DashboardLayout contextTitle="Proposal Draft">
            <Box direction="row" justify="between" fill>
                <Heading>Proposal Draft</Heading>
            </Box>
        </DashboardLayout>
    )
}
