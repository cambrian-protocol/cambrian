import { Box, Button } from 'grommet'
import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'

import CeramicStagehand from '@cambrian/app/classes/CeramicStagehand'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import Link from 'next/link'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useRouter } from 'next/router'
import { useState } from 'react'

interface ProposalPublishStepProps {
    proposalStreamID: string
}

const ProposalPublishStep = ({
    proposalStreamID,
}: ProposalPublishStepProps) => {
    const { currentUser } = useCurrentUser()

    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const onSubmitProposal = async () => {
        setIsSubmitting(true)
        try {
            if (!currentUser) throw GENERAL_ERROR['NO_WALLET_CONNECTION']

            const ceramicStagehand = new CeramicStagehand(currentUser.selfID)
            await ceramicStagehand.submitProposal(proposalStreamID)
            router.push(
                `${window.location.origin}/proposals/${proposalStreamID}`
            )
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
            setIsSubmitting(false)
        }
    }
    return (
        <>
            <Box height={{ min: '60vh' }} justify="between">
                <HeaderTextSection title="Proposal ready to submit" />
                {
                    <Box direction="row" justify="between">
                        <Link
                            href={`${window.location.origin}/dashboard/proposals/edit/${proposalStreamID}`}
                            passHref
                        >
                            <Button
                                size="small"
                                secondary
                                label={'Edit Proposal'}
                            />
                        </Link>
                        <LoaderButton
                            isLoading={isSubmitting}
                            primary
                            label={'Submit'}
                            onClick={onSubmitProposal}
                        />
                    </Box>
                }
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

export default ProposalPublishStep
