import { BigNumber, ethers } from 'ethers'
import { Box, Button, Form, FormField } from 'grommet'
import React, { SetStateAction, useEffect, useState } from 'react'
import {
    Stages,
    getSolverConfigsFromMetaStages,
} from '@cambrian/app/classes/Stagehand'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import { ERC20_ABI } from '@cambrian/app/constants'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import FundingProgressMeter from '@cambrian/app/components/progressMeters/FundingProgressMeter'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import ProposalsHub from '@cambrian/app/contracts/ProposalsHubContract'
import { TRANSACITON_MESSAGE } from '@cambrian/app/constants/TransactionMessages'
import { TokenAPI } from '@cambrian/app/services/api/Token.api'
import TokenAvatar from '@cambrian/app/components/avatars/TokenAvatar'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'

interface FundProposalFormProps {
    proposal: ethers.Contract
    proposalsHub: ProposalsHub
    metaStages: Stages
    setIsProposalExecuted: React.Dispatch<SetStateAction<boolean>>
}

type FundProposalFormType = {
    amount: number
}

const initialInput = {
    amount: 0,
}

const FundProposalForm = ({
    proposal,
    proposalsHub,
    metaStages,
    setIsProposalExecuted,
}: FundProposalFormProps) => {
    const user = useCurrentUser()
    const [input, setInput] = useState<FundProposalFormType>(initialInput)
    const [funding, setFunding] = useState(BigNumber.from(0))
    const [hasApprovedTokenAccess, setHasApprovedTokenAccess] = useState(false)
    const [collateralToken, setCollateralToken] = useState<TokenModel>()
    const [transactionMessage, setTransactionMessage] = useState<string>()
    const [errorMsg, setErrorMsg] = useState<string>()

    useEffect(() => {
        initTokenAndFunding()
        initProposalsHubListeners()
        return () => {
            proposalsHub.contract.removeAllListeners()
        }
    }, [])

    useEffect(() => {
        initERC20Listener()
        // TODO Clean up listener
    }, [collateralToken, user])

    const initTokenAndFunding = async () => {
        const token = await TokenAPI.getTokenInfo(proposal.collateralToken)
        setCollateralToken(token)

        const funding = await proposalsHub.getProposalFunding(proposal.id)
        if (funding) setFunding(funding)
    }

    const initERC20Listener = () => {
        if (collateralToken && user.currentUser) {
            // TODO Extract erc20 token contract
            const tokenContract = new ethers.Contract(
                collateralToken.address,
                ERC20_ABI,
                user.currentUser.signer
            )

            tokenContract.on(
                tokenContract.filters.Approval(null, null, null),
                () => {
                    setHasApprovedTokenAccess(true)
                    setTransactionMessage(undefined)
                }
            )
        }
    }

    const initProposalsHubListeners = async () => {
        proposalsHub.contract.on(
            proposalsHub.contract.filters.FundProposal(null, null, null),
            async (proposalId) => {
                await updateFunding(proposalId)
                setHasApprovedTokenAccess(false)
            }
        )

        proposalsHub.contract.on(
            proposalsHub.contract.filters.DefundProposal(null, null, null),
            async (proposalId) => {
                await updateFunding(proposalId)
            }
        )

        proposalsHub.contract.on(
            proposalsHub.contract.filters.ExecuteProposal(null),
            async (proposalId) => {
                const updatedProposal = await proposalsHub.getProposal(
                    proposalId
                )
                if (updatedProposal && updatedProposal.isExecuted) {
                    setIsProposalExecuted(true)
                    setTransactionMessage(undefined)
                }
            }
        )
    }

    const updateFunding = async (proposalId: string) => {
        const proposalFunding = await proposalsHub.getProposalFunding(
            proposalId
        )
        if (proposalFunding) {
            setInput(initialInput)
            setFunding(proposalFunding)
            setTransactionMessage(undefined)
        }
    }

    const safeTransactionCall = async (contractCall: () => Promise<void>) => {
        setTransactionMessage(TRANSACITON_MESSAGE['CONFIRM'])
        try {
            await contractCall()
            setTransactionMessage(TRANSACITON_MESSAGE['WAIT'])
        } catch (e: any) {
            console.error(e)
            setErrorMsg(e.message)
            setTransactionMessage(undefined)
        }
    }

    const onApproveFunding = async () => {
        safeTransactionCall(() =>
            proposalsHub.approveFunding(collateralToken!, input.amount)
        )
    }

    const onFundProposal = async () => {
        safeTransactionCall(() =>
            proposalsHub.fundProposal(
                proposal.id,
                collateralToken!,
                input.amount
            )
        )
    }

    const onDefundProposal = async () => {
        safeTransactionCall(() =>
            proposalsHub.defundProposal(
                proposal.id,
                collateralToken!,
                input.amount
            )
        )
    }

    const onExecuteProposal = async () => {
        safeTransactionCall(async () => {
            const solverConfigs = await getSolverConfigsFromMetaStages(
                metaStages
            )
            await proposalsHub.executeProposal(proposal.id, solverConfigs)
        })
    }

    return (
        <>
            {collateralToken ? (
                <BaseFormContainer>
                    <BaseFormGroupContainer>
                        <FundingProgressMeter
                            token={collateralToken}
                            funding={funding}
                            fundingGoal={proposal.fundingGoal}
                        />
                    </BaseFormGroupContainer>
                    <Form<FundProposalFormType>
                        onChange={(nextValue: FundProposalFormType) => {
                            setInput(nextValue)
                        }}
                        value={input}
                        onSubmit={
                            funding.eq(proposal.fundingGoal)
                                ? onExecuteProposal
                                : hasApprovedTokenAccess
                                ? onFundProposal
                                : onApproveFunding
                        }
                    >
                        <Box gap="medium">
                            <BaseFormGroupContainer
                                direction="row"
                                gap="small"
                                justify="center"
                            >
                                <Box>
                                    <FormField
                                        name="amount"
                                        label="Amount"
                                        type="number"
                                        required
                                    />
                                </Box>
                                <TokenAvatar token={collateralToken} />
                            </BaseFormGroupContainer>
                            <Box direction="row" justify="between">
                                <Button
                                    secondary
                                    label="Defund Proposal"
                                    onClick={onDefundProposal}
                                />
                                {funding.eq(proposal.fundingGoal) ? (
                                    <Button
                                        primary
                                        type="submit"
                                        label="Execute Proposal"
                                    />
                                ) : hasApprovedTokenAccess ? (
                                    <Button
                                        primary
                                        type="submit"
                                        label="Fund Proposal"
                                    />
                                ) : (
                                    <Button
                                        primary
                                        type="submit"
                                        label="Approve Transfer"
                                    />
                                )}
                            </Box>
                        </Box>
                    </Form>
                </BaseFormContainer>
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['TOKEN']} />
            )}
            {errorMsg && (
                <ErrorPopupModal
                    onClose={() => setErrorMsg(undefined)}
                    errorMessage={errorMsg}
                />
            )}
            {transactionMessage && (
                <LoadingScreen context={transactionMessage} />
            )}
        </>
    )
}

export default FundProposalForm
