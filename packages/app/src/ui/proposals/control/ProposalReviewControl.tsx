import { CheckCircle, PencilLine } from 'phosphor-react'
import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'

import { Box } from 'grommet'
import CeramicTemplateAPI from '@cambrian/app/services/ceramic/CeramicTemplateAPI'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useProposalContext } from '@cambrian/app/hooks/useProposalContext'
import { useState } from 'react'

interface ProposalReviewControlProps {
    currentUser: UserType
    isApproving: boolean
    setIsApproving: React.Dispatch<React.SetStateAction<boolean>>
}

const ProposalReviewControl = ({
    currentUser,
    setIsApproving,
    isApproving,
}: ProposalReviewControlProps) => {
    const ceramicTemplateAPI = new CeramicTemplateAPI(currentUser)
    const { stageStack } = useProposalContext()

    const [isRequestingChange, setIsRequestingChange] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const onApproveProposal = async () => {
        setIsApproving(true)
        if (stageStack) {
            try {
                const res = await ceramicTemplateAPI.approveProposal(
                    currentUser,
                    stageStack
                )

                if (!res) throw GENERAL_ERROR['PROPOSAL_APPROVE_ERROR']
            } catch (e) {
                setErrorMessage(await cpLogger.push(e))
            }
        }
        setIsApproving(false)
    }

    const onRequestChange = async () => {
        setIsRequestingChange(true)
        if (stageStack) {
            try {
                const res = await ceramicTemplateAPI.requestProposalChange(
                    stageStack
                )

                if (!res) throw GENERAL_ERROR['PROPOSAL_REQUEST_CHANGE_ERROR']
            } catch (e) {
                setIsRequestingChange(false)
                setErrorMessage(await cpLogger.push(e))
            }
        }
    }

    return (
        <>
            <Box gap="medium">
                <PlainSectionDivider />
                <TwoButtonWrapContainer
                    primaryButton={
                        <LoaderButton
                            disabled={isRequestingChange}
                            icon={<CheckCircle />}
                            isLoading={isApproving}
                            label="Approve Proposal"
                            primary
                            onClick={onApproveProposal}
                        />
                    }
                    secondaryButton={
                        <LoaderButton
                            disabled={isApproving}
                            isLoading={isRequestingChange}
                            label="Request Change"
                            secondary
                            icon={<PencilLine />}
                            onClick={onRequestChange}
                        />
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

export default ProposalReviewControl
