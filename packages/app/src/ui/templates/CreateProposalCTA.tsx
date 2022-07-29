import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'

import { Box } from 'grommet'
import CeramicStagehand from '@cambrian/app/classes/CeramicStagehand'
import { ClipboardText } from 'phosphor-react'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import randimals from 'randimals'
import router from 'next/router'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useState } from 'react'

interface CreateProposalCTAProps {
    templateStreamID: string
}

const CreateProposalCTA = ({ templateStreamID }: CreateProposalCTAProps) => {
    const { currentUser } = useCurrentUser()
    const [isCreatingProposal, setIsCreatingProposal] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const onCreateProposal = async () => {
        setIsCreatingProposal(true)
        try {
            if (!currentUser) throw GENERAL_ERROR['NO_WALLET_CONNECTION']

            const ceramicStagehand = new CeramicStagehand(currentUser.selfID)
            const { streamID } = await ceramicStagehand.createProposal(
                randimals(),
                templateStreamID
            )
            router.push(
                `${window.location.origin}/dashboard/proposals/new/${streamID}`
            )
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
            setIsCreatingProposal(false)
        }
    }
    return (
        <Box align="end" pad={{ top: 'medium' }}>
            <LoaderButton
                onClick={onCreateProposal}
                isLoading={isCreatingProposal}
                size="small"
                primary
                label="Create Proposal"
                icon={<ClipboardText />}
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
