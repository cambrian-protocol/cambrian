import { Box, Button, Text } from 'grommet'

import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import Link from 'next/link'
import ProposalSubmitComponent from './ProposalSubmitComponent'
import { UserType } from '@cambrian/app/store/UserContext'

interface ProposalDraftSidebarProps {
    currentUser: UserType
    proposalStreamID: string
    updateProposal: () => Promise<void>
}

const ProposalDraftSidebar = ({
    currentUser,
    proposalStreamID,
    updateProposal,
}: ProposalDraftSidebarProps) => {
    return (
        <Box gap="medium">
            <ProposalSubmitComponent
                updateProposal={updateProposal}
                currentUser={currentUser}
                proposalStreamID={proposalStreamID}
            />
            <BaseFormGroupContainer border pad="medium" gap="medium">
                <Text>Edit your Proposal</Text>
                <Link
                    href={`${window.location.origin}/dashboard/proposals/edit/${proposalStreamID}`}
                    passHref
                >
                    <Button
                        secondary
                        size="small"
                        label="Edit Proposal"
                        primary
                    />
                </Link>
            </BaseFormGroupContainer>
        </Box>
    )
}

export default ProposalDraftSidebar
