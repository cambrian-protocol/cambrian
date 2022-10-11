import BaseActionbar, { ActionbarInfoType } from '../BaseActionbar'
import { Box, Text } from 'grommet'
import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'
import {
    SolverSafetyCheckResponseType,
    solverSafetyCheck,
} from '@cambrian/app/utils/helpers/safetyChecks'
import { useEffect, useState } from 'react'

import ActionbarItemDropContainer from '@cambrian/app/components/containers/ActionbarItemDropContainer'
import CeramicTemplateAPI from '@cambrian/app/services/ceramic/CeramicTemplateAPI'
import ClipboardButton from '@cambrian/app/components/buttons/ClipboardButton'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { StageStackType } from '../../../../ui/dashboard/ProposalsDashboardUI'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { User } from 'phosphor-react'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ellipseAddress } from '@cambrian/app/utils/helpers/ellipseAddress'

interface ProposalReviewActionbarProps {
    stageStack: StageStackType
    currentUser: UserType
    isApproving: boolean
    setIsApproving: React.Dispatch<React.SetStateAction<boolean>>
    messenger?: JSX.Element
    proposedPrice: PriceModel
}

export type PriceModel = { amount?: number; token?: TokenModel }

const ProposalReviewActionbar = ({
    stageStack,
    currentUser,
    setIsApproving,
    isApproving,
    messenger,
    proposedPrice,
}: ProposalReviewActionbarProps) => {
    const ceramicTemplateAPI = new CeramicTemplateAPI(currentUser)

    const [isRequestingChange, setIsRequestingChange] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [safetyChecks, setSafetyChecks] =
        useState<SolverSafetyCheckResponseType>()
    const [passedSafetyChecks, setPassedSafetyChecks] = useState(false)
    const [isCheckingSolvers, setIsCheckingSolvers] = useState(true)

    useEffect(() => {
        safetyCheckSolver()
    }, [])

    const safetyCheckSolver = async () => {
        const results = await solverSafetyCheck(stageStack, currentUser)
        if (results) {
            let success = true
            results.forEach((solverResult) =>
                solverResult.forEach((result) => {
                    if (result.result === false) success = false
                })
            )
            setPassedSafetyChecks(success)
            setSafetyChecks(results)
        }
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

    const invalidSolverConfigInfo: ActionbarInfoType = {
        title: 'Unable to approve this Proposal',
        subTitle: 'Click on "More" to find details',
        dropContent: (
            <ActionbarItemDropContainer
                title="Some recipients are not able to receive ERC1155 Tokens"
                description="Please double check the following address(es):"
                list={safetyChecks
                    ?.flat()
                    .filter((check) => check.result === false)
                    .map((failedCheck) => {
                        return {
                            icon: <User />,
                            label: 'Recipient address',
                            description: (
                                <Box direction="row" gap="small" align="center">
                                    <Text size="small" color="status-error">
                                        {ellipseAddress(failedCheck.to, 10)}
                                    </Text>
                                    <ClipboardButton
                                        size="xsmall"
                                        value={failedCheck.to}
                                    />
                                </Box>
                            ),
                        }
                    })}
            />
        ),
    }

    return (
        <>
            <BaseActionbar
                messenger={messenger}
                primaryAction={
                    <LoaderButton
                        isLoading={isApproving}
                        disabled={isRequestingChange || !passedSafetyChecks}
                        primary
                        size="small"
                        onClick={onApproveProposal}
                        label={'Approve Proposal'}
                    />
                }
                secondaryAction={
                    <LoaderButton
                        secondary
                        disabled={isApproving}
                        isLoading={isRequestingChange}
                        size="small"
                        onClick={onRequestChange}
                        label={'Request Change'}
                    />
                }
                info={
                    !isCheckingSolvers && !passedSafetyChecks
                        ? invalidSolverConfigInfo
                        : {
                              title: `${
                                  proposedPrice.amount === undefined
                                      ? ''
                                      : proposedPrice.amount
                              } ${proposedPrice.token?.symbol || ''}`,
                              subTitle: 'Proposed price',
                              dropContent: (
                                  <ActionbarItemDropContainer
                                      title="Proposal review"
                                      description="Approve this proposal by hitting the 'Approve Proposal'-Button at your right or request a change from the proposer at the 'Request Change'-Button. You can directly chat with the author of the Proposal and discuss any adjustments to the Proposal."
                                  />
                              ),
                          }
                }
            />
            {errorMessage && (
                <ErrorPopupModal
                    errorMessage={errorMessage}
                    onClose={() => setErrorMessage(undefined)}
                />
            )}
        </>
    )
}

export default ProposalReviewActionbar
