import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import { Box } from 'grommet'
import Messenger from '@cambrian/app/components/messenger/Messenger'
import ProposalStartFundingComponent from './ProposalStartFundingComponent'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import ProposalSubmitComponent from './ProposalSubmitComponent'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useProposal } from '@cambrian/app/hooks/useProposal'

const ProposalEditSidebar = () => {
    const { currentUser } = useCurrentUser()
    const { proposalStatus, proposalStack } = useProposal()

    return (
        <Box gap="medium">
            {proposalStatus === ProposalStatus.Draft && (
                <ProposalSubmitComponent />
            )}
            {proposalStatus === ProposalStatus.Approved && (
                <ProposalStartFundingComponent />
            )}
            {currentUser &&
                proposalStack &&
                proposalStack.templateDoc.content.receivedProposals[
                    proposalStack.proposalDoc.id.toString()
                ] && (
                    <BaseFormContainer pad="medium" gap="medium">
                        <Messenger
                            currentUser={currentUser}
                            chatID={proposalStack.proposalDoc.id.toString()}
                            chatType={'Draft'}
                        />
                    </BaseFormContainer>
                )}
        </Box>
    )
}

export default ProposalEditSidebar
