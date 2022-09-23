import { Box } from 'grommet'
import { Coins } from 'phosphor-react'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
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
    const { stageStack } = useProposalContext()
    const [isInTransaction, setIsInTransaction] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const onDeployProposal = async () => {
        setIsInTransaction(true)
        try {
            if (currentUser && stageStack) {
                await deployProposal(currentUser, stageStack)
            }
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
