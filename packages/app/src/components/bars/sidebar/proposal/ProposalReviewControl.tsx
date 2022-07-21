import { CheckCircle, PencilLine } from 'phosphor-react'

import { Box } from 'grommet'
import CeramicStagehand from '@cambrian/app/classes/CeramicStagehand'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useProposal } from '@cambrian/app/hooks/useProposal'
import { useState } from 'react'

const ProposalReviewControl = () => {
    const { currentUser } = useCurrentUser()
    const { proposalStack, proposalStreamDoc, updateProposal } = useProposal()

    const [isRequestingChange, setIsRequestingChange] = useState(false)
    const [isApproving, setIsApproving] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const onApproveProposal = async () => {
        setIsApproving(true)
        if (currentUser && proposalStack && proposalStreamDoc) {
            try {
                const cs = new CeramicStagehand(currentUser.selfID)
                await cs.approveProposal(
                    currentUser,
                    proposalStreamDoc,
                    proposalStack
                )
                await updateProposal()
            } catch (e) {
                setErrorMessage(await cpLogger.push(e))
            }
        }
        setIsApproving(false)
    }

    const onRequestChange = async () => {
        setIsRequestingChange(true)
        if (currentUser && proposalStreamDoc) {
            try {
                const cs = new CeramicStagehand(currentUser.selfID)
                await cs.requestProposalChange(proposalStreamDoc)
                await updateProposal()
            } catch (e) {
                setErrorMessage(await cpLogger.push(e))
            }
        }
        setIsRequestingChange(false)
    }

    return (
        <>
            <Box gap="small" direction="row" justify="end">
                <LoaderButton
                    isLoading={isRequestingChange}
                    label="Request Change"
                    secondary
                    icon={<PencilLine />}
                    onClick={onRequestChange}
                />
                <LoaderButton
                    icon={<CheckCircle />}
                    isLoading={isApproving}
                    label="Approve Proposal"
                    primary
                    onClick={onApproveProposal}
                />
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

export default ProposalReviewControl
