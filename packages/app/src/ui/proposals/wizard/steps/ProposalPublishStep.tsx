import { Box, Button } from 'grommet'
import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'

import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import CeramicStagehand from '@cambrian/app/classes/CeramicStagehand'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import Link from 'next/link'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useRouter } from 'next/router'
import { useState } from 'react'

interface ProposalPublishStepProps {
    proposalStreamDoc: TileDocument<CeramicProposalModel>
}

const ProposalPublishStep = ({
    proposalStreamDoc,
}: ProposalPublishStepProps) => {
    const { currentUser } = useCurrentUserContext()

    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const onSubmitProposal = async () => {
        setIsSubmitting(true)
        try {
            if (!currentUser) throw GENERAL_ERROR['NO_WALLET_CONNECTION']

            const ceramicStagehand = new CeramicStagehand(currentUser.ceramic)
            await ceramicStagehand.submitProposal(proposalStreamDoc)
            router.push(
                `${
                    window.location.origin
                }/proposals/${proposalStreamDoc.id.toString()}`
            )
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
            setIsSubmitting(false)
        }
    }
    return (
        <>
            <Box height={{ min: '50vh' }} justify="between">
                <Box pad="xsmall">
                    <HeaderTextSection
                        title="Proposal ready to submit"
                        paragraph="You can submit your Proposal to the Seller or keep it as a draft and send it as soon as it is good to go."
                    />
                </Box>
                <TwoButtonWrapContainer
                    primaryButton={
                        <LoaderButton
                            isLoading={isSubmitting}
                            primary
                            label={'Submit'}
                            onClick={onSubmitProposal}
                        />
                    }
                    secondaryButton={
                        <Link
                            href={`${
                                window.location.origin
                            }/dashboard/proposals/edit/${proposalStreamDoc.id.toString()}`}
                            passHref
                        >
                            <Button
                                size="small"
                                secondary
                                label={'Edit Proposal'}
                            />
                        </Link>
                    }
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

export default ProposalPublishStep
