import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'

import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import CeramicStagehand from '@cambrian/app/classes/CeramicStagehand'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { Text } from 'grommet'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useProposal } from '@cambrian/app/hooks/useProposal'
import { useState } from 'react'

const ProposalStartFundingComponent = () => {
    const { currentUser } = useCurrentUser()
    const { proposalStack } = useProposal()
    const [isInTransaction, setIsInTransaction] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const onDeployProposal = async () => {
        setIsInTransaction(true)
        try {
            if (!currentUser) throw GENERAL_ERROR['NO_WALLET_CONNECTION']
            if (!proposalStack) throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']

            const ceramicStagehand = new CeramicStagehand(currentUser.selfID)
            await ceramicStagehand.deployProposal(currentUser, proposalStack)
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsInTransaction(false)
    }

    return (
        <>
            <BaseFormGroupContainer pad="medium" gap="medium">
                <Text>
                    Proposal approved! It can now be published on-chain and
                    funded.
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
