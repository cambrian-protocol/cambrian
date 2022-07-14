import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import CeramicStagehand from '@cambrian/app/classes/CeramicStagehand'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { Text } from 'grommet'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useState } from 'react'

interface ProposalStartFundingComponentProps {
    currentUser: UserType
    ceramicProposal: CeramicProposalModel
    ceramicTemplate: CeramicTemplateModel
    proposalCommitID: string
    proposalStreamID: string
}

const ProposalStartFundingComponent = ({
    currentUser,
    ceramicTemplate,
    ceramicProposal,
    proposalStreamID,
    proposalCommitID,
}: ProposalStartFundingComponentProps) => {
    const [isInTransaction, setIsInTransaction] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const onDeployProposal = async () => {
        setIsInTransaction(true)
        try {
            const cs = new CeramicStagehand(currentUser.selfID)
            await cs.deployProposal(
                proposalStreamID,
                proposalCommitID,
                ceramicTemplate,
                ceramicProposal,
                currentUser
            )
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsInTransaction(false)
    }

    return (
        <>
            <BaseFormGroupContainer pad="medium" gap="medium">
                <Text>
                    Proposal has been approved. This action deployes the
                    Proposal on chain
                </Text>
                <LoaderButton
                    isLoading={isInTransaction}
                    label="Start funding"
                    primary
                    size="small"
                    onClick={onDeployProposal}
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

export default ProposalStartFundingComponent
