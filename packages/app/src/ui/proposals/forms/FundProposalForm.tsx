import { BigNumber, ethers } from 'ethers'
import { Box, Button, Form, FormField, Text } from 'grommet'
import React, { SetStateAction, useEffect, useRef, useState } from 'react'
import {
    Stages,
    getSolverConfigsFromMetaStages,
} from '@cambrian/app/classes/Stagehand'
import {
    addTokenDecimals,
    formatDecimals,
    getFormattedNumber,
} from '@cambrian/app/utils/helpers/tokens'

import { ArrowLineUp } from 'phosphor-react'
import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import { ERC20_ABI } from '@cambrian/app/constants'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import FundingProgressMeter from '@cambrian/app/components/progressMeters/FundingProgressMeter'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import ProposalsHub from '@cambrian/app/hubs/ProposalsHub'
import { TRANSACITON_MESSAGE } from '@cambrian/app/constants/TransactionMessages'
import { TokenAPI } from '@cambrian/app/services/api/Token.api'
import TokenAvatar from '@cambrian/app/components/avatars/TokenAvatar'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { UserType } from '@cambrian/app/store/UserContext'

interface FundProposalFormProps {
    proposal: ethers.Contract
    proposalsHub: ProposalsHub
    metaStages: Stages
    currentUser: UserType
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
    currentUser,
    setIsProposalExecuted,
}: FundProposalFormProps) => {
    const [input, _setInput] = useState<FundProposalFormType>(initialInput)

    // Necessary to access amount state in approvalListener
    const inputRef = useRef(input)
    const setInput = (newInput: FundProposalFormType) => {
        inputRef.current = newInput
        _setInput(newInput)
    }

    const [funding, setFunding] = useState(BigNumber.from(0))
    const [currentAllowance, setCurrentAllowance] = useState<BigNumber>()
    const [collateralToken, setCollateralToken] = useState<TokenModel>()
    const [transactionMessage, setTransactionMessage] = useState<string>()
    const [errorMsg, setErrorMsg] = useState<string>()

    const erc20TokenContract = new ethers.Contract(
        proposal.collateralToken,
        ERC20_ABI,
        currentUser.signer
    )

    const approvalFilter = erc20TokenContract.filters.Approval(
        currentUser.address,
        proposal.address,
        null
    )

    useEffect(() => {
        initAllowance()
    }, [currentUser])

    useEffect(() => {
        initTokenAndFunding()
        initProposalsHubListeners()
        return () => {
            proposalsHub.contract.removeAllListeners()
        }
    }, [])

    useEffect(() => {
        erc20TokenContract.on(approvalFilter, approvalListener)
        return () => {
            erc20TokenContract.removeListener(approvalFilter, approvalListener)
        }
    }, [input])

    const initAllowance = async () => {
        try {
            const allowanceWei = await erc20TokenContract.allowance(
                currentUser.address,
                proposalsHub.contract.address
            )
            if (BigNumber.from(allowanceWei).gt(0)) {
                setCurrentAllowance(allowanceWei)
                setInput({
                    amount: getFormattedNumber(allowanceWei),
                })
            } else {
                setCurrentAllowance(undefined)
                setInput(initialInput)
            }
        } catch (e) {
            console.warn(e)
        }
    }

    const approvalListener = (
        owner: string,
        spender: string,
        amount: BigNumber
    ) => {
        if (
            Number(inputRef.current.amount) ===
            Number(formatDecimals(proposal.collateralToken, amount))
        ) {
            setCurrentAllowance(amount)
        }
        setTransactionMessage(undefined)
    }

    const initTokenAndFunding = async () => {
        const token = await TokenAPI.getTokenInfo(
            proposal.collateralToken,
            currentUser.web3Provider
        )
        setCollateralToken(token)

        const funding = await proposalsHub.getProposalFunding(proposal.id)
        if (funding) setFunding(funding)
    }

    const initProposalsHubListeners = async () => {
        proposalsHub.contract.on(
            proposalsHub.contract.filters.FundProposal(null, null, null),
            async (proposalId) => {
                await updateFunding(proposalId)
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
            await initAllowance()
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
            proposalsHub.approveFunding(input.amount, collateralToken)
        )
    }

    const onFundProposal = async () => {
        safeTransactionCall(() =>
            proposalsHub.fundProposal(
                proposal.id,
                input.amount,
                collateralToken
            )
        )
    }

    const onDefundProposal = async () => {
        safeTransactionCall(() =>
            proposalsHub.defundProposal(
                proposal.id,
                input.amount,
                collateralToken
            )
        )
    }

    const onExecuteProposal = async () => {
        safeTransactionCall(async () => {
            const solverConfigs = await getSolverConfigsFromMetaStages(
                metaStages,
                currentUser.web3Provider
            )
            await proposalsHub.executeProposal(proposal.id, solverConfigs)
        })
    }

    const inputMaxAmount = () => {
        const max = proposal.fundingGoal.sub(funding)
        setInput({ amount: getFormattedNumber(max, collateralToken) })
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
                                : currentAllowance?.gte(
                                      addTokenDecimals(
                                          input.amount,
                                          collateralToken
                                      )
                                  )
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
                                    {currentAllowance !== undefined && (
                                        <Text size="small" color="dark-4">
                                            You have approved access to{' '}
                                            {getFormattedNumber(
                                                currentAllowance,
                                                collateralToken
                                            )}{' '}
                                            {collateralToken.symbol}
                                        </Text>
                                    )}
                                </Box>
                                <TokenAvatar token={collateralToken} />
                                <Box alignSelf="center">
                                    <Button
                                        label="Max"
                                        icon={<ArrowLineUp />}
                                        onClick={inputMaxAmount}
                                    />
                                </Box>
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
                                ) : currentAllowance?.gte(
                                      addTokenDecimals(
                                          input.amount,
                                          collateralToken
                                      )
                                  ) ? (
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
