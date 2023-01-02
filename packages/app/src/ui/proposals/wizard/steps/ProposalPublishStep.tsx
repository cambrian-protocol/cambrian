import { Box, Button } from 'grommet'

import CeramicProposalAPI from '@cambrian/app/services/ceramic/CeramicProposalAPI'
import { EditProposalType } from '@cambrian/app/hooks/useEditProposal'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import Link from 'next/link'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useErrorContext } from '@cambrian/app/hooks/useErrorContext'
import { useRouter } from 'next/router'
import { useState } from 'react'

const ProposalPublishStep = ({
    editProposalProps,
}: {
    editProposalProps: EditProposalType
}) => {
    const { showAndLogError } = useErrorContext()
    const { proposalStreamID } = editProposalProps
    const { currentUser } = useCurrentUserContext()

    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const onSubmitProposal = async () => {
        setIsSubmitting(true)
        try {
            if (!currentUser) throw GENERAL_ERROR['NO_WALLET_CONNECTION']

            const ceramicProposalAPI = new CeramicProposalAPI(currentUser)
            await ceramicProposalAPI.submitProposal(proposalStreamID)
            router.push(`${window.location.origin}/solver/${proposalStreamID}`)
        } catch (e) {
            showAndLogError(e)
            setIsSubmitting(false)
        }
    }
    return (
        <Box height={{ min: '50vh' }} justify="between">
            <Box pad="xsmall">
                <HeaderTextSection
                    title="Ready to submit proposal"
                    paragraph="Your proposal has been saved. You may submit it now or leave it as a draft."
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
                        href={`${window.location.origin}/proposal/edit/${proposalStreamID}`}
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
    )
}

export default ProposalPublishStep
