import { Box, Text } from 'grommet'
import { Chats, PencilLine, User } from 'phosphor-react'
import React, { useEffect, useState } from 'react'
import {
    SolverSafetyCheckResponseType,
    solverSafetyCheck,
} from '@cambrian/app/utils/solverSafety.utils'

import ActionbarItemDropContainer from '@cambrian/app/components/containers/ActionbarItemDropContainer'
import BaseActionbar from '../../BaseActionbar'
import ClipboardButton from '@cambrian/app/components/buttons/ClipboardButton'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import Proposal from '@cambrian/app/classes/stages/Proposal'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ellipseAddress } from '@cambrian/app/utils/helpers/ellipseAddress'

interface ITemplaterReviewBar {
    proposal: Proposal
}

const TemplaterReviewBar = ({ proposal }: ITemplaterReviewBar) => {
    const [isApproving, setIsApproving] = useState(false)
    const [isRequestingChange, setIsRequestingChange] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [safetyChecks, setSafetyChecks] =
        useState<SolverSafetyCheckResponseType>()
    const [isCheckingSolvers, setIsCheckingSolvers] = useState(true)
    const [passedSafetyChecks, setPassedSafetyChecks] = useState(false)

    useEffect(() => {
        if (proposal.auth) safetyCheckSolver(proposal.auth)
    }, [])

    const safetyCheckSolver = async (user: UserType) => {
        const results = await solverSafetyCheck(proposal, user)
        if (!results) {
            setIsCheckingSolvers(false)
            return
        }
        const success = results.every((solverResult) =>
            solverResult.every((result) => result.result)
        )
        setPassedSafetyChecks(success)
        setSafetyChecks(results)
        setIsCheckingSolvers(false)
    }

    const onApproveProposal = async () => {
        setIsApproving(true)
        try {
            await proposal.approve()
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsApproving(false)
    }

    const onRequestChange = async () => {
        setIsRequestingChange(true)
        try {
            await proposal.requestChange()
        } catch (e) {
            setIsRequestingChange(false)
            setErrorMessage(await cpLogger.push(e))
        }
    }

    const invalidSolverConfigInfo = {
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

    const reviewInfo = {
        title: `${proposal.content.price.amount} ${proposal.collateralToken.symbol}`,
        subTitle: 'Proposed price',
        dropContent: (
            <ActionbarItemDropContainer
                title="Proposal review"
                description="Approve this proposal by hitting the 'Approve Proposal'-Button at your right or request a change from the proposer at the 'Request Change'-Button."
                list={[
                    {
                        icon: <Chats />,
                        label: 'Directly chat with the Proposal author',
                    },
                    {
                        icon: <PencilLine />,
                        label: 'Provide any desired changes via chat',
                    },
                ]}
            />
        ),
    }

    return (
        <>
            <BaseActionbar
                primaryAction={
                    <LoaderButton
                        isLoading={isApproving}
                        disabled={isRequestingChange || !passedSafetyChecks}
                        primary
                        onClick={onApproveProposal}
                        label={'Approve'}
                    />
                }
                secondaryAction={
                    <LoaderButton
                        secondary
                        disabled={isApproving}
                        isLoading={isRequestingChange}
                        onClick={onRequestChange}
                        label={'Request Change'}
                    />
                }
                info={
                    !isCheckingSolvers && !passedSafetyChecks
                        ? invalidSolverConfigInfo
                        : reviewInfo
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

export default TemplaterReviewBar
