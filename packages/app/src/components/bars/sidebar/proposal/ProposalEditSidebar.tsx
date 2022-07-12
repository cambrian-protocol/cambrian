import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import { Box } from 'grommet'
import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import Messenger from '@cambrian/app/components/Messenger'
import ProposalStartFundingComponent from './ProposalStartFundingComponent'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import ProposalSubmitComponent from './ProposalSubmitComponent'
import { UserType } from '@cambrian/app/store/UserContext'

interface ProposalEditSidebarProps {
    currentUser: UserType
    proposalStreamID: string
    updateProposal: () => Promise<void>
    proposalStatus: ProposalStatus
    ceramicProposal: CeramicProposalModel
    ceramicTemplate: CeramicTemplateModel
}

const ProposalEditSidebar = ({
    currentUser,
    proposalStreamID,
    updateProposal,
    proposalStatus,
    ceramicProposal,
    ceramicTemplate,
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
            {proposalStatus === ProposalStatus.Approved &&
                ceramicProposal &&
                ceramicTemplate && (
                    <ProposalStartFundingComponent
                        proposalStreamID={proposalStreamID}
                        currentUser={currentUser}
                        ceramicProposal={ceramicProposal}
                        ceramicTemplate={ceramicTemplate}
                    />
                )}
            <BaseFormContainer pad="medium" gap="medium">
                <Messenger
                    currentUser={currentUser}
                    chatID={proposalStreamID}
                    chatType={'Draft'}
                />
            </BaseFormContainer>
        </Box>
    )
}

export default ProposalEditSidebar
