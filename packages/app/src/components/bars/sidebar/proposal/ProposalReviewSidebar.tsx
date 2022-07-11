import { Box, Text } from 'grommet'

import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import CeramicStagehand from '@cambrian/app/classes/CeramicStagehand'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useState } from 'react'

interface ProposalReviewSidebarProps {
    currentUser: UserType
    proposalStreamID: string
    updateProposal: () => Promise<void>
}

const ProposalReviewSidebar = ({
    currentUser,
    updateProposal,
    proposalStreamID,
}: ProposalReviewSidebarProps) => {
    const [isRequestingChange, setIsRequestingChange] = useState(false)
    const [isApproving, setIsApproving] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const onApproveProposal = async () => {
        setIsApproving(true)
        try {
            const cs = new CeramicStagehand(currentUser.selfID)
            await cs.approveProposal(proposalStreamID)
            await updateProposal()
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsApproving(false)
    }

    const onRequestChange = async () => {
        setIsRequestingChange(true)
        try {
            const cs = new CeramicStagehand(currentUser.selfID)
            await cs.requestProposalChange(proposalStreamID)
            await updateProposal()
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsRequestingChange(false)
    }

    return (
        <>
            <Box gap="medium">
                <BaseFormGroupContainer border pad="medium" gap="medium">
                    <Text>After approval the proposal can get funded</Text>
                    <LoaderButton
                        isLoading={isApproving}
                        label="Approve Proposal"
                        primary
                        onClick={onApproveProposal}
                    />
                </BaseFormGroupContainer>
                <BaseFormGroupContainer border pad="medium" gap="medium">
                    <Text>
                        After you request a change, the proposer can edit his
                        proposal again and resubmit his proposal.
                    </Text>
                    <LoaderButton
                        isLoading={isRequestingChange}
                        label="Request Change"
                        primary
                        onClick={onRequestChange}
                    />
                </BaseFormGroupContainer>
            </Box>
            {errorMessage && (
                <ErrorPopupModal
                    errorMessage={errorMessage}
                    onClose={() => setErrorMessage(undefined)}
                />
            )}
        </>
    )
}

export default ProposalReviewSidebar
