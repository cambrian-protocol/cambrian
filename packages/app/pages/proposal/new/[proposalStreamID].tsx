import { Box } from 'grommet'
import Custom404Page from 'packages/app/pages/404'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import ProposalWizard from '@cambrian/app/ui/proposals/wizard/ProposalWizard'
import _ from 'lodash'
import useEditProposal from '@cambrian/app/hooks/useEditProposal'

export default function NewProposalPage() {
    const { isLoaded, proposal, stageStack, errorMessage, setErrorMessage } =
        useEditProposal()

    return (
        <>
            {!isLoaded ? (
                <LoadingScreen context={LOADING_MESSAGE['PROPOSAL']} />
            ) : proposal && stageStack ? (
                <PageLayout contextTitle="New Proposal" kind="narrow">
                    <Box align="center">
                        <Box width={'xlarge'} gap="large">
                            <ProposalWizard />
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
