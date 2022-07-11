import { Box } from 'grommet'
import ConnectWalletSection from '@cambrian/app/components/sections/ConnectWalletSection'
import Custom404Page from 'packages/app/pages/404'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import ProposalWizard from '@cambrian/app/ui/proposals/wizard/ProposalWizard'
import _ from 'lodash'
import useEditProposal from '@cambrian/app/hooks/useEditProposal'

export default function NewProposalPage() {
    const {
        isUserLoaded,
        currentUser,
        show404NotFound,
        proposalInput,
        setProposalInput,
        template,
        composition,
        onSaveProposal,
        proposalStreamID,
        errorMessage,
        setErrorMessage,
    } = useEditProposal()

    return (
        <>
            {isUserLoaded ? (
                currentUser ? (
                    show404NotFound || proposalInput?.submitted ? (
                        <Custom404Page />
                    ) : proposalInput && template && composition ? (
                        <PageLayout contextTitle="New Proposal">
                            <Box align="center" pad="large">
                                <Box width={'xlarge'} gap="large">
                                    <ProposalWizard
                                        template={template}
                                        composition={composition}
                                        currentUser={currentUser}
                                        proposalInput={proposalInput}
                                        setProposalInput={setProposalInput}
                                        onSaveProposal={onSaveProposal}
                                        proposalStreamID={
                                            proposalStreamID as string
                                        }
                                    />
                                </Box>
                            </Box>
                        </PageLayout>
                    ) : (
                        <LoadingScreen context={LOADING_MESSAGE['PROPOSAL']} />
                    )
                ) : (
                    <PageLayout contextTitle="Connect your Wallet">
                        <ConnectWalletSection />
                    </PageLayout>
                )
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['WALLET']} />
            )}
            {errorMessage && (
                <ErrorPopupModal
                    onClose={() => setErrorMessage(undefined)}
                    errorMessage={errorMessage}
                />
            )}
        </>
    )
}
