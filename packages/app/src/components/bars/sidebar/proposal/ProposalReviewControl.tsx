import { CheckCircle, PencilLine } from 'phosphor-react'

import CeramicStagehand from '@cambrian/app/classes/CeramicStagehand'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useProposal } from '@cambrian/app/hooks/useProposal'
import { useState } from 'react'

const ProposalReviewControl = () => {
    const { currentUser } = useCurrentUser()
    const { proposalStack, proposalStreamDoc, templateStreamDoc } =
        useProposal()

    const [isRequestingChange, setIsRequestingChange] = useState(false)
    const [isApproving, setIsApproving] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const onApproveProposal = async () => {
        setIsApproving(true)
        if (
            currentUser &&
            proposalStack &&
            proposalStreamDoc &&
            templateStreamDoc
        ) {
            try {
                const cs = new CeramicStagehand(currentUser.selfID)
                await cs.approveProposal(
                    currentUser,
                    proposalStreamDoc,
                    templateStreamDoc,
                    proposalStack
                )
            } catch (e) {
                setIsApproving(false)
                setErrorMessage(await cpLogger.push(e))
            }
        }
    }

    const onRequestChange = async () => {
        setIsRequestingChange(true)
        if (currentUser && proposalStreamDoc && templateStreamDoc) {
            try {
                const cs = new CeramicStagehand(currentUser.selfID)
                await cs.requestProposalChange(
                    proposalStreamDoc,
                    templateStreamDoc
                )
            } catch (e) {
                setIsRequestingChange(false)
                setErrorMessage(await cpLogger.push(e))
            }
        }
    }

    return (
        <>
            <TwoButtonWrapContainer
                primaryButton={
                    <LoaderButton
                        disabled={isRequestingChange}
                        icon={<CheckCircle />}
                        isLoading={isApproving}
                        label="Approve Proposal"
                        primary
                        onClick={onApproveProposal}
                    />
                }
                secondaryButton={
                    <LoaderButton
                        disabled={isApproving}
                        isLoading={isRequestingChange}
                        label="Request Change"
                        secondary
                        icon={<PencilLine />}
                        onClick={onRequestChange}
                    />
                }
            />
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
