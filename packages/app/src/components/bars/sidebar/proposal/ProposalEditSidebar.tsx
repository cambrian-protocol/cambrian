import { Box, Text } from 'grommet'

import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import ProposalStartFundingComponent from './ProposalStartFundingComponent'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import ProposalSubmitComponent from './ProposalSubmitComponent'
import { UserType } from '@cambrian/app/store/UserContext'

interface ProposalEditSidebarProps {
    currentUser: UserType
    proposalStreamID: string
    updateProposal: () => Promise<void>
    proposalStatus: ProposalStatus
}

const ProposalEditSidebar = ({
    currentUser,
    proposalStreamID,
    updateProposal,
    proposalStatus,
}: ProposalEditSidebarProps) => {
    return (
        <Box gap="medium">
            {proposalStatus === ProposalStatus.Draft && (
                <ProposalSubmitComponent
                    updateProposal={updateProposal}
                    currentUser={currentUser}
                    proposalStreamID={proposalStreamID}
                />
            )}
            {proposalStatus === ProposalStatus.Approved && (
                <ProposalStartFundingComponent />
            )}
            <BaseFormGroupContainer border pad="medium" gap="medium">
                <Text>Messenger Placeholder</Text>
            </BaseFormGroupContainer>
        </Box>
    )
}

export default ProposalEditSidebar
