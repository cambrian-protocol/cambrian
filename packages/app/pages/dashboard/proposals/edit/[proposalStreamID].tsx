import { Box } from 'grommet'
import ConnectWalletSection from '@cambrian/app/components/sections/ConnectWalletSection'
import Custom404Page from 'packages/app/pages/404'
import EditProposalUI from '@cambrian/app/ui/proposals/EditProposalUI'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import InteractionLayout from '@cambrian/app/components/layout/InteractionLayout'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import ProposalEditSidebar from '@cambrian/app/components/bars/sidebar/proposal/ProposalEditSidebar'
import ProposalHeader from '@cambrian/app/components/layout/header/ProposalHeader'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import _ from 'lodash'
import useEditProposal from '@cambrian/app/hooks/useEditProposal'

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
        proposalStatus,
        proposalStreamID,
        updateProposal,
    } = useEditProposal()
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
                        <InteractionLayout
                            contextTitle={'Edit Proposal'}
                            proposalHeader={
                                <ProposalHeader
                                    proposalTitle={cachedProposal.title}
                                    proposalStatus={proposalStatus}
                                    ceramicTemplate={template}
                                />
                            }
                            sidebar={
                                <ProposalEditSidebar
                                    proposalStatus={proposalStatus}
                                    updateProposal={updateProposal}
                                    currentUser={currentUser}
                                    proposalStreamID={proposalStreamID}
                                />
                            }
                        >
                            <Box gap="medium">
                                <EditProposalUI
                                    proposalStatus={proposalStatus}
                                    template={template}
                                    composition={composition}
                                    currentUser={currentUser}
                                    proposalInput={proposalInput}
                                    setProposalInput={setProposalInput}
                                    onSaveProposal={onSaveProposal}
                                    onResetProposal={onResetProposal}
                                />
                            </Box>
                        </InteractionLayout>
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
