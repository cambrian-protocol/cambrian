import { Box } from 'grommet'
import Custom404Page from 'packages/app/pages/404'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import ProposalWizard from './wizard/ProposalWizard'
import useEditProposal from '@cambrian/app/hooks/useEditProposal'

const NewProposalUI = () => {
    const {
        isLoaded,
        proposalInput,
        setProposalInput,
        proposalStack,
        onSaveProposal,
        proposalStreamDoc,
        errorMessage,
        setErrorMessage,
    } = useEditProposal()

    return (
        <>
            {!isLoaded ? (
                <LoadingScreen context={LOADING_MESSAGE['PROPOSAL']} />
            ) : proposalInput && proposalStack && proposalStreamDoc ? (
                <PageLayout contextTitle="New Proposal" kind="narrow">
                    <Box align="center" pad="large">
                        <Box width={'xlarge'} gap="large">
                            <ProposalWizard
                                proposalStreamDoc={proposalStreamDoc}
                                onSaveProposal={onSaveProposal}
                                proposalStack={proposalStack}
                                proposalInput={proposalInput}
                                setProposalInput={setProposalInput}
                            />
                        </Box>
                    </Box>
                </PageLayout>
            ) : (
                <Custom404Page />
            )}
            {errorMessage && (
                <ErrorPopupModal
                    errorMessage={errorMessage}
                    onClose={() => setErrorMessage(undefined)}
                />
            )}
        </>
    )
}

export default NewProposalUI
