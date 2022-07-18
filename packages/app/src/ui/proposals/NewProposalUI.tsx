import { Box } from 'grommet'
import Custom404Page from 'packages/app/pages/404'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import ProposalWizard from './wizard/ProposalWizard'
import { useProposal } from '@cambrian/app/hooks/useProposal'

const NewProposalUI = () => {
    const { isLoaded, proposalInput } = useProposal()

    return (
        <>
            {!isLoaded ? (
                <LoadingScreen context={LOADING_MESSAGE['PROPOSAL']} />
            ) : proposalInput ? (
                <PageLayout contextTitle="New Proposal">
                    <Box align="center" pad="large">
                        <Box width={'xlarge'} gap="large">
                            <ProposalWizard />
                        </Box>
                    </Box>
                </PageLayout>
            ) : (
                <Custom404Page />
            )}
        </>
    )
}

export default NewProposalUI
