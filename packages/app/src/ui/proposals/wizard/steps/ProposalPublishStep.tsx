import { Box, Button } from 'grommet'

import CeramicStagehand from '@cambrian/app/classes/CeramicStagehand'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import Link from 'next/link'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useRouter } from 'next/router'
import { useState } from 'react'

interface ProposalPublishStepProps {
    proposalStreamID: string
    currentUser: UserType
}

const ProposalPublishStep = ({
    proposalStreamID,
    currentUser,
}: ProposalPublishStepProps) => {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const onSubmitProposal = async () => {
        setIsSubmitting(true)
        try {
            const ceramicStagehand = new CeramicStagehand(currentUser.selfID)
            await ceramicStagehand.submitProposal(proposalStreamID)
            router.push(
                `${window.location.origin}/proposals/${proposalStreamID}`
            )
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsSubmitting(false)
    }
    return (
        <>
            <Box height={{ min: '60vh' }} justify="between">
                <HeaderTextSection title="Proposal ready to submit" />
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
