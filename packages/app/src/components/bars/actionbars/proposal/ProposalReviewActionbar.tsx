import BaseActionbar, { ActionbarInfoType } from '../BaseActionbar'
import { Box, Text } from 'grommet'
import { Chats, PencilLine, User } from 'phosphor-react'
import {
    SolverSafetyCheckResponseType,
    solverSafetyCheck,
} from '@cambrian/app/utils/solverSafety.utils'
import { useEffect, useState } from 'react'

import ActionbarItemDropContainer from '@cambrian/app/components/containers/ActionbarItemDropContainer'
import ClipboardButton from '@cambrian/app/components/buttons/ClipboardButton'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import Messenger from '@cambrian/app/components/messenger/Messenger'
import Proposal from '@cambrian/app/classes/stages/Proposal'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ellipseAddress } from '@cambrian/app/utils/helpers/ellipseAddress'

interface ProposalReviewActionbarProps {
    proposal: Proposal
    isApproving: boolean
    setIsApproving: React.Dispatch<React.SetStateAction<boolean>>
}

const ProposalReviewActionbar = ({
    proposal,
    setIsApproving,
    isApproving,
}: ProposalReviewActionbarProps) => {
    const [isRequestingChange, setIsRequestingChange] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [safetyChecks, setSafetyChecks] =
        useState<SolverSafetyCheckResponseType>()
    const [passedSafetyChecks, setPassedSafetyChecks] = useState(false)
    const [isCheckingSolvers, setIsCheckingSolvers] = useState(true)

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
            {proposal.isTemplateAuthor ? (
                <BaseActionbar
                    messenger={
                        <Messenger
                            chatID={proposal.doc.streamID}
                            currentUser={proposal.auth!}
                            participantDIDs={[
                                proposal.content.author,
                                proposal.template.content.author,
                            ]}
                        />
                    }
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
                    }
                />
            ) : proposal.isProposalAuthor ? (
                <BaseActionbar
                    messenger={
                        <Messenger
                            chatID={proposal.doc.streamID}
                            currentUser={proposal.auth!}
                            participantDIDs={[
                                proposal.content.author,
                                proposal.template.content.author,
                            ]}
                        />
                    }
                    info={{
                        title: `Proposal on review`,
                        subTitle:
                            'Please wait until the Proposal has been reviewed',
                        dropContent: (
                            <ActionbarItemDropContainer
                                title="Proposal review"
                                description="Please wait until the Proposal has been approved or a change is requested."
                                list={[
                                    {
                                        icon: <Chats />,
                                        label: 'Directly chat with the Template author',
                                    },
                                    {
                                        icon: <PencilLine />,
                                        label: 'Discuss adjustments to the Proposal via chat',
                                    },
                                ]}
                            />
                        ),
                    }}
                />
            ) : (
                <></>
            )}
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
