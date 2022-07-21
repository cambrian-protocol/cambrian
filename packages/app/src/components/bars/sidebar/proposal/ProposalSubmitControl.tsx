import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'

import { Box } from 'grommet'
import CeramicStagehand from '@cambrian/app/classes/CeramicStagehand'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import useEditProposal from '@cambrian/app/hooks/useEditProposal'
import { useRouter } from 'next/router'
import { useState } from 'react'

const ProposalSubmitControl = () => {
    const { currentUser } = useCurrentUser()
    const { proposalStreamDoc } = useEditProposal()
    const router = useRouter()

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const onSubmitProposal = async () => {
        setIsSubmitting(true)
        try {
            if (!currentUser) throw GENERAL_ERROR['NO_WALLET_CONNECTION']
            if (!proposalStreamDoc) throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']

            const ceramicStagehand = new CeramicStagehand(currentUser.selfID)
            await ceramicStagehand.submitProposal(proposalStreamDoc)

            router.push(
                `${
                    window.location.origin
                }/proposals/${proposalStreamDoc?.id.toString()}`
            )
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
            setIsSubmitting(false)
        }
    }
    return (
        <Box align="end" pad={{ horizontal: 'small' }}>
            <LoaderButton
                isLoading={isSubmitting}
                label="Submit Proposal"
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
