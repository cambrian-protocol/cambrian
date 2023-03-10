import { Box, Button } from 'grommet'
import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'

import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'
import ButtonRowContainer from '@cambrian/app/components/containers/ButtonRowContainer'
import CeramicProposalAPI from '@cambrian/app/services/ceramic/CeramicProposalAPI'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import Link from 'next/link'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useProposalContext } from '@cambrian/app/hooks/useProposalContext'
import { useRouter } from 'next/router'
import { useState } from 'react'

const ProposalPublishStep = () => {
    const { currentUser } = useCurrentUserContext()
    const { proposal } = useProposalContext()

    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const onSubmitProposal = async () => {
        setIsSubmitting(true)
        try {
            if (!currentUser) throw GENERAL_ERROR['UNAUTHORIZED']

            if (!proposal) throw new Error('Proposal not initialized')

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
        <>
            <Box>
                <HeaderTextSection
                    title="Ready to submit proposal"
                    paragraph="Your proposal has been saved. You may submit it now or leave it as a draft."
                />
                {proposal ? (
                    <ButtonRowContainer
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
                                href={`${window.location.origin}/proposal/edit/${proposal.doc.streamID}`}
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
                ) : (
                    <BaseSkeletonBox width={'100%'} height="small" />
                )}
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
