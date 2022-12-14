import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'

import { Box } from 'grommet'
import CeramicProposalAPI from '@cambrian/app/services/ceramic/CeramicProposalAPI'
import { EditProposalType } from '@cambrian/app/hooks/useEditProposal'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { PaperPlaneRight } from 'phosphor-react'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useRouter } from 'next/router'
import { useState } from 'react'

interface ProposalSubmitControl {
    editProposalProps: EditProposalType
}

const ProposalSubmitControl = ({
    editProposalProps,
}: ProposalSubmitControl) => {
    const { proposalStreamID, isValidProposal, onSaveProposal } =
        editProposalProps
    const { currentUser } = useCurrentUserContext()
    const router = useRouter()

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const onSubmitProposal = async () => {
        setIsSubmitting(true)
        try {
            if (currentUser) {
                if (await onSaveProposal()) {
                    const ceramicProposalAPI = new CeramicProposalAPI(
                        currentUser
                    )
                    if (
                        await ceramicProposalAPI.submitProposal(
                            proposalStreamID
                        )
                    ) {
                        router.push(
                            `${window.location.origin}/solver/${proposalStreamID}`
                        )
                    } else {
                        throw GENERAL_ERROR['PROPOSAL_SUBMIT_ERROR']
                    }
                }
            }
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
            setIsSubmitting(false)
        }
    }
    return (
        <Box>
            <LoaderButton
                icon={<PaperPlaneRight />}
                disabled={!isValidProposal}
                isLoading={isSubmitting}
                reverse
                label="Save & Submit"
                primary
                onClick={onSubmitProposal}
            />
            {errorMessage && (
                <ErrorPopupModal
                    errorMessage={errorMessage}
                    onClose={() => setErrorMessage(undefined)}
                />
            )}
        </Box>
    )
}

export default ProposalSubmitControl
