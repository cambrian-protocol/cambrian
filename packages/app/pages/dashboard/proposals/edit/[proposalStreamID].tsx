import { Box } from 'grommet'
import ConnectWalletSection from '@cambrian/app/components/sections/ConnectWalletSection'
import Custom404Page from 'packages/app/pages/404'
import EditProposalUI from '@cambrian/app/ui/proposals/EditProposalUI'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import ProposalDraftHeader from '@cambrian/app/components/layout/header/ProposalDraftHeader'
import _ from 'lodash'
import useProposal from '@cambrian/app/hooks/useProposal'

export default function EditProposalPage() {
    const {
        isUserLoaded,
        currentUser,
        show404NotFound,
        proposalInput,
        setProposalInput,
        template,
        composition,
        onSaveProposal,
        errorMessage,
        setErrorMessage,
        cachedProposal,
        onResetProposal,
    } = useProposal()

    return (
        <>
            {isUserLoaded ? (
                currentUser ? (
                    show404NotFound ? (
                        <Custom404Page />
                    ) : proposalInput &&
                      composition &&
                      cachedProposal &&
                      template ? (
                        <PageLayout contextTitle="Edit Proposal">
                            <Box align="center" pad="large">
                                <Box width={'xlarge'} gap="large">
                                    <ProposalDraftHeader
                                        title={cachedProposal.title}
                                    />
                                    <EditProposalUI
                                        template={template}
                                        composition={composition}
                                        currentUser={currentUser}
                                        proposalInput={proposalInput}
                                        setProposalInput={setProposalInput}
                                        onSaveProposal={onSaveProposal}
                                        onResetProposal={onResetProposal}
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
