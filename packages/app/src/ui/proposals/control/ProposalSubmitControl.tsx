import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'

import { Box } from 'grommet'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { PaperPlaneRight } from 'phosphor-react'
import Proposal from '@cambrian/app/classes/stages/Proposal'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useRouter } from 'next/router'
import { useState } from 'react'

interface ProposalSubmitControl {
    proposal: Proposal
}

const ProposalSubmitControl = ({ proposal }: ProposalSubmitControl) => {
    const { currentUser } = useCurrentUserContext()
    const router = useRouter()

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const onSubmitProposal = async () => {
        setIsSubmitting(true)
        try {
            if (!currentUser) throw GENERAL_ERROR['UNAUTHORIZED']

            await proposal.submit()

            router.push(
                `${window.location.origin}/solver/${proposal.doc.streamID}`
            )
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
            setIsSubmitting(false)
        }
    }
    return (
        <Box>
            <LoaderButton
                icon={<PaperPlaneRight />}
                disabled={!proposal.isValid}
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
