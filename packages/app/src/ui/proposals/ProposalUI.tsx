import Custom404Page from 'packages/app/pages/404'
import InteractionLayout from '@cambrian/app/components/layout/InteractionLayout'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import ProposalHeader from '@cambrian/app/components/layout/header/ProposalHeader'
import ProposalInfo from './ProposalInfo'
import ProposalSidebar from './ProposalSidebar'
import { useProposal } from '@cambrian/app/hooks/useProposal'

const ProposalUI = ({}) => {
    const { isLoaded, proposalStack } = useProposal()

    return (
        <>
            {!isLoaded ? (
                <LoadingScreen context={LOADING_MESSAGE['PROPOSAL']} />
            ) : proposalStack ? (
                <InteractionLayout
                    contextTitle={
                        proposalStack.proposalDoc.content.title || 'Proposal'
                    }
                    proposalHeader={<ProposalHeader />}
                    sidebar={<ProposalSidebar />}
                >
                    <ProposalInfo
                        ceramicProposal={proposalStack.proposalDoc.content}
                        hideTitle
                    />
                </InteractionLayout>
            ) : (
                <Custom404Page />
            )}
        </>
    )
}

export default ProposalUI
