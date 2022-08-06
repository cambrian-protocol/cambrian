import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'

import { Box } from 'grommet'
import { Coins } from 'phosphor-react'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { deployProposal } from '@cambrian/app/utils/helpers/proposalHelper'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useProposalContext } from '@cambrian/app/hooks/useProposalContext'
import { useState } from 'react'

const ProposalStartFundingControl = () => {
    const { currentUser } = useCurrentUserContext()
    const { proposalStack } = useProposalContext()
    const [isInTransaction, setIsInTransaction] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const onDeployProposal = async () => {
        setIsInTransaction(true)
        try {
            if (!currentUser) throw GENERAL_ERROR['NO_WALLET_CONNECTION']
            if (!proposalStack) throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']

            await deployProposal(currentUser, proposalStack)
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsInTransaction(false)
    }

    return (
        <>
            <Box gap="medium">
                <PlainSectionDivider />
                <LoaderButton
                    isLoading={isInTransaction}
                    label="Start funding"
                    primary
                    icon={<Coins />}
                    size="small"
                    onClick={onDeployProposal}
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

export default ProposalStartFundingControl
