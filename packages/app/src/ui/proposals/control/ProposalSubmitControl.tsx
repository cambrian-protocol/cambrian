import CeramicProposalAPI from '@cambrian/app/services/ceramic/CeramicProposalAPI'
import { EditProposalType } from '@cambrian/app/hooks/useEditProposal'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { PaperPlaneRight } from 'phosphor-react'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useErrorContext } from '@cambrian/app/hooks/useErrorContext'
import { useRouter } from 'next/router'
import { useState } from 'react'

interface ProposalSubmitControl {
    editProposalProps: EditProposalType
}

const ProposalSubmitControl = ({
    editProposalProps,
}: ProposalSubmitControl) => {
    const { setAndLogError } = useErrorContext()
    const { proposalStreamID, isValidProposal, onSaveProposal } =
        editProposalProps
    const { currentUser } = useCurrentUserContext()
    const router = useRouter()

    const [isSubmitting, setIsSubmitting] = useState(false)

    const onSubmitProposal = async () => {
        setIsSubmitting(true)
        try {
            if (currentUser) {
                if (await onSaveProposal()) {
                    const ceramicProposalAPI = new CeramicProposalAPI(
                        currentUser
                    )
                    if (
                        await ceramicProposalAPI.submitProposal(
                            proposalStreamID
                        )
                    ) {
                        router.push(
                            `${window.location.origin}/solver/${proposalStreamID}`
                        )
                    } else {
                        throw GENERAL_ERROR['PROPOSAL_SUBMIT_ERROR']
                    }
                }
            }
        } catch (e) {
            setAndLogError(e)
            setIsSubmitting(false)
        }
    }
    return (
        <LoaderButton
            icon={<PaperPlaneRight />}
            disabled={!isValidProposal}
            isLoading={isSubmitting}
            reverse
            label="Save & Submit"
            primary
            onClick={onSubmitProposal}
        />
    )
}

export default ProposalSubmitControl
