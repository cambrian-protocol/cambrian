import { Box, Text } from 'grommet'

import CeramicStagehand from '@cambrian/app/classes/CeramicStagehand'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import randimals from 'randimals'
import router from 'next/router'
import { useState } from 'react'

interface CreateProposalCTAProps {
    templateStreamID: string
    currentUser: UserType
}

const CreateProposalCTA = ({
    templateStreamID,
    currentUser,
}: CreateProposalCTAProps) => {
    const [isCreatingProposal, setIsCreatingProposal] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const onCreateProposal = async () => {
        setIsCreatingProposal(true)
        try {
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
        <>
            <Box
                pad={'small'}
                border
                round="xsmall"
                gap="small"
                background={'background-contrast'}
            >
                <Text>Interested in this template?</Text>
                <LoaderButton
                    onClick={onCreateProposal}
                    isLoading={isCreatingProposal}
                    size="small"
                    primary
                    label="Create Proposal"
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

export default CreateProposalCTA
