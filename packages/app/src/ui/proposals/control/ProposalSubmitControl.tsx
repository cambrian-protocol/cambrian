import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'

import { Box } from 'grommet'
import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import CeramicStagehand from '@cambrian/app/classes/CeramicStagehand'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { PaperPlaneRight } from 'phosphor-react'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useRouter } from 'next/router'
import { useState } from 'react'

interface ProposalSubmitControlProps {
    onSave: () => Promise<boolean>
    proposalStreamDoc: TileDocument<CeramicProposalModel>
    isValidProposal: boolean
}

const ProposalSubmitControl = ({
    onSave,
    isValidProposal,
    proposalStreamDoc,
}: ProposalSubmitControlProps) => {
    const { currentUser } = useCurrentUserContext()
    const router = useRouter()

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const onSubmitProposal = async () => {
        setIsSubmitting(true)
        try {
            if (currentUser && proposalStreamDoc) {
                if (await onSave()) {
                    const ceramicStagehand = new CeramicStagehand(
                        currentUser.selfID
                    )
                    if (
                        await ceramicStagehand.submitProposal(proposalStreamDoc)
                    ) {
                        router.push(
                            `${
                                window.location.origin
                            }/proposals/${proposalStreamDoc.id.toString()}`
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