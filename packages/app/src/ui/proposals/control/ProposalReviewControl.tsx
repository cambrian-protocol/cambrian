import { Box, Text } from 'grommet'
import { CheckCircle, PencilLine, WarningOctagon } from 'phosphor-react'
import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'
import { useEffect, useState } from 'react'

import CeramicTemplateAPI from '@cambrian/app/services/ceramic/CeramicTemplateAPI'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import { StageStackType } from '../../dashboard/ProposalsDashboardUI'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { solverSafetyCheck } from '@cambrian/app/utils/helpers/safetyChecks'
import { useProposalContext } from '@cambrian/app/hooks/useProposalContext'

interface ProposalReviewControlProps {
    stageStack: StageStackType
    currentUser: UserType
    isApproving: boolean
    setIsApproving: React.Dispatch<React.SetStateAction<boolean>>
}

const ProposalReviewControl = ({
    stageStack,
    currentUser,
    setIsApproving,
    isApproving,
}: ProposalReviewControlProps) => {
    const ceramicTemplateAPI = new CeramicTemplateAPI(currentUser)

    const [isRequestingChange, setIsRequestingChange] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [passedSafetyChecks, setPassedSafetyChecks] = useState(false)
    const [isCheckingSolvers, setIsCheckingSolvers] = useState(true)

    useEffect(() => {
        safetyCheckSolver()
    }, [])

    const safetyCheckSolver = async () => {
        setPassedSafetyChecks(await solverSafetyCheck(stageStack, currentUser))
        setIsCheckingSolvers(false)
    }

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
                <Box pad="xsmall">
                    {isCheckingSolvers ? (
                        <></>
                    ) : (
                        !passedSafetyChecks && (
                            <Box
                                background={'status-error'}
                                round="xsmall"
                                pad="small"
                                direction="row"
                                align="center"
                                gap="small"
                                justify="center"
                            >
                                <WarningOctagon size="24" />
                                <Text size="small">
                                    Warning, one or more recipients are not able
                                    to receive ERC1155 Tokens!
                                </Text>
                            </Box>
                        )
                    )}
                </Box>
                <TwoButtonWrapContainer
                    primaryButton={
                        <LoaderButton
                            disabled={isRequestingChange || !passedSafetyChecks}
                            icon={<CheckCircle />}
                            isLoading={isApproving || isCheckingSolvers}
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
