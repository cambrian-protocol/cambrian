import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'

import { Box } from 'grommet'
import CeramicProposalAPI from '@cambrian/app/services/ceramic/CeramicProposalAPI'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { isNewProfile } from '@cambrian/app/utils/helpers/profileHelper'
import randimals from 'randimals'
import router from 'next/router'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useState } from 'react'

interface CreateProposalCTAProps {
    templateStreamID: string
}

const CreateProposalCTA = ({ templateStreamID }: CreateProposalCTAProps) => {
    const { currentUser } = useCurrentUserContext()
    const [isCreatingProposal, setIsCreatingProposal] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const onCreateProposal = async () => {
        setIsCreatingProposal(true)
        try {
            if (!currentUser) throw GENERAL_ERROR['NO_WALLET_CONNECTION']

            const ceramicProposalAPI = new CeramicProposalAPI(currentUser)
            const streamID = await ceramicProposalAPI.createProposal(
                randimals(),
                templateStreamID
            )

            if (!streamID) throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']

            if (isNewProfile(currentUser.cambrianProfileDoc.content)) {
                router.push(`/profile/new/${streamID}?target=proposal`)
            } else {
                router.push(
                    `${window.location.origin}/proposal/new/${streamID}`
                )
            }
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
            setIsCreatingProposal(false)
        }
    }
    return (
        <Box pad={{ top: 'medium' }}>
            <LoaderButton
                onClick={onCreateProposal}
                isLoading={isCreatingProposal}
                size="small"
                primary
                label="Create Proposal"
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

export default CreateProposalCTA
