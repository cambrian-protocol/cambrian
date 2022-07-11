import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import CeramicStagehand from '@cambrian/app/classes/CeramicStagehand'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { Text } from 'grommet'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useState } from 'react'

interface ProposalSubmitComponentProps {
    currentUser: UserType
    proposalStreamID: string
    updateProposal: () => Promise<void>
}

const ProposalSubmitComponent = ({
    currentUser,
    proposalStreamID,
    updateProposal,
}: ProposalSubmitComponentProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const onSubmitProposal = async () => {
        setIsSubmitting(true)
        try {
            const ceramicStagehand = new CeramicStagehand(currentUser.selfID)
            await ceramicStagehand.submitProposal(proposalStreamID)
            await updateProposal()
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsSubmitting(false)
    }
    return (
        <>
            <BaseFormGroupContainer border pad="medium" gap="medium">
                <Text>Submit your Proposal</Text>
                <LoaderButton
                    isLoading={isSubmitting}
                    label="Submit Proposal"
                    primary
                    onClick={onSubmitProposal}
                />
            </BaseFormGroupContainer>
            {errorMessage && (
                <ErrorPopupModal
                    errorMessage={errorMessage}
                    onClose={() => setErrorMessage(undefined)}
                />
            )}
        </>
    )
}

export default ProposalSubmitComponent
