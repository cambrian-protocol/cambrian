import { ArrowLineUp, CheckCircle, Info } from 'phosphor-react'
import { BigNumber, ethers } from 'ethers'
import { Box, Button, Form, FormField, Text } from 'grommet'
import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'
import React, { SetStateAction, useEffect, useRef, useState } from 'react'

import { ERC20_IFACE } from 'packages/app/config/ContractInterfaces'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import FundingProgressMeter from '@cambrian/app/components/progressMeters/FundingProgressMeter'
import { IPFSAPI } from '@cambrian/app/services/api/IPFS.api'
import IPFSSolutionsHub from '@cambrian/app/hubs/IPFSSolutionsHub'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import ProposalsHub from '@cambrian/app/hubs/ProposalsHub'
import { SolverConfigModel } from '@cambrian/app/models/SolverConfigModel'
import { TokenAPI } from '@cambrian/app/services/api/Token.api'
import TokenAvatar from '@cambrian/app/components/avatars/TokenAvatar'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'

interface FundProposalFormProps {
    proposal: ethers.Contract
    proposalsHub: ProposalsHub
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
    const [isInPrimaryTransaction, setIsInPrimaryTransaction] = useState(false)
    const [isInSecondaryTransaction, setIsInSecondaryTransaction] =
        useState(false)
    const [errorMsg, setErrorMsg] = useState<ErrorMessageType>()
    const [currentUserFunding, setCurrentUserFunding] = useState<BigNumber>(
        BigNumber.from(0)
    )

    const erc20TokenContract = new ethers.Contract(
        proposal.collateralToken,
        ERC20_IFACE,
        currentUser.signer
    )

    const approvalFilter = erc20TokenContract.filters.Approval(
        currentUser.address,
        proposal.address,
        null
    )
    useEffect(() => {
        initTokenAndFunding()
    }, [])

    useEffect(() => {
        initAllowance()
        updateUserFunding(proposal.id)
        erc20TokenContract.on(approvalFilter, approvalListener)
        return () => {
            erc20TokenContract.removeListener(approvalFilter, approvalListener)
        }
    }, [currentUser])

    useEffect(() => {
        initProposalsHubListeners()
        return () => {
            proposalsHub.contract.removeAllListeners()
        }
    }, [currentUser])

    const initAllowance = async () => {
        try {
            const allowanceWei = await erc20TokenContract.allowance(
                currentUser.address,
                proposalsHub.contract.address
            )
            if (BigNumber.from(allowanceWei).gt(0)) {
                setCurrentAllowance(allowanceWei)
                setInput({
                    amount: Number(
                        ethers.utils.formatUnits(
                            allowanceWei,
                            collateralToken?.decimals
                        )
                    ),
                })
            } else {
                setCurrentAllowance(undefined)
                setInput(initialInput)
            }
        } catch (e) {
            cpLogger.push(e)
        }
    }

    const approvalListener = (
        owner: string,
        spender: string,
        amount: BigNumber
    ) => {
        if (
            Number(inputRef.current.amount) ===
            Number(ethers.utils.formatUnits(amount, collateralToken?.decimals))
        ) {
            setCurrentAllowance(amount)
        }
        setIsInPrimaryTransaction(false)
    }

    const initTokenAndFunding = async () => {
        const token = await TokenAPI.getTokenInfo(
            proposal.collateralToken,
            currentUser.web3Provider
        )
        setCollateralToken(token)

        const funding = await proposalsHub.getProposalFunding(proposal.id)
        if (funding) setFunding(funding)
        await updateUserFunding(proposal.id)
    }

    const initProposalsHubListeners = async () => {
        proposalsHub.contract.on(
            proposalsHub.contract.filters.FundProposal(proposal.id, null, null),
            async (proposalId) => {
                await updateFunding(proposalId)
                setIsInPrimaryTransaction(false)
            }
        )

        proposalsHub.contract.on(
            proposalsHub.contract.filters.DefundProposal(
                proposal.id,
                null,
                null
            ),
            async (proposalId) => {
                await updateFunding(proposalId)
                setIsInSecondaryTransaction(false)
            }
        )

        proposalsHub.contract.on(
            proposalsHub.contract.filters.ExecuteProposal(proposal.id),
            async (proposalId) => {
                const updatedProposal = await proposalsHub.getProposal(
                    proposalId
                )
                if (updatedProposal && updatedProposal.isExecuted) {
                    setIsProposalExecuted(true)
                    setIsInPrimaryTransaction(false)
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
        }
    }

    const updateUserFunding = async (proposalId: string) => {
        const userFunding = await proposalsHub.contract.funderAmountMap(
            proposal.id,
            currentUser.address
        )
        if (userFunding) setCurrentUserFunding(userFunding)
    }

    const safeTransactionCall = async (
        contractCall: () => Promise<void>,
        isLoading: React.Dispatch<SetStateAction<boolean>>
    ) => {
        isLoading(true)
        try {
            await contractCall()
        } catch (e) {
            isLoading(false)
            setErrorMsg(await cpLogger.push(e))
        }
    }

    const onApproveFunding = async () => {
        safeTransactionCall(
            () => proposalsHub.approveFunding(input.amount, collateralToken),
            setIsInPrimaryTransaction
        )
    }

    const onFundProposal = async () => {
        safeTransactionCall(
            () =>
                proposalsHub.fundProposal(
                    proposal.id,
                    input.amount,
                    collateralToken
                ),
            setIsInPrimaryTransaction
        )
    }

    const onDefundProposal = async () => {
        safeTransactionCall(
            () =>
                proposalsHub.defundProposal(
                    proposal.id,
                    input.amount,
                    collateralToken
                ),
            setIsInSecondaryTransaction
        )
    }

    const onExecuteProposal = async () => {
        safeTransactionCall(async () => {
            if (currentUser.signer && currentUser.chainId) {
                // Retrieving SolverConfigs from Solution
                const solutionsHub = new IPFSSolutionsHub(
                    currentUser.signer,
                    currentUser.chainId
                )
                const solution = await solutionsHub.getSolution(
                    proposal.solutionId
                )

                if (!solution) throw GENERAL_ERROR['SOLUTION_FETCH_ERROR']

                if (solution.solverConfigsURI) {
                    const ipfs = new IPFSAPI()
                    const solverConfigs = (await ipfs.getFromCID(
                        solution.solverConfigsURI
                    )) as SolverConfigModel[]

                    if (!solverConfigs) throw GENERAL_ERROR['IPFS_FETCH_ERROR']

                    await proposalsHub.executeProposal(
                        proposal.id,
                        solverConfigs
                    )
                }
            }
        }, setIsInPrimaryTransaction)
    }

    const inputMaxAmount = () => {
        const max = proposal.fundingGoal.sub(funding)
        setInput({
            amount: Number(
                ethers.utils.formatUnits(max, collateralToken?.decimals)
            ),
        })
    }

    const isValidInput =
        typeof input.amount != 'undefined' &&
        input.amount &&
        input.amount > 0 &&
        input.amount <=
            Number(
                ethers.utils.formatUnits(
                    proposal.fundingGoal,
                    collateralToken?.decimals
                )
            )

    const disableButtons = isInPrimaryTransaction || isInSecondaryTransaction

    return (
        <>
            {collateralToken ? (
                <Box gap="medium">
                    <FundingProgressMeter
                        token={collateralToken}
                        funding={funding}
                        fundingGoal={proposal.fundingGoal}
                        userFunding={currentUserFunding}
                    />
                    <Form<FundProposalFormType>
                        onChange={(nextValue: FundProposalFormType) => {
                            setInput(nextValue)
                        }}
                        value={input}
                        onSubmit={
                            funding.eq(proposal.fundingGoal)
                                ? onExecuteProposal
                                : input.amount &&
                                  currentAllowance?.gte(
                                      ethers.utils.parseUnits(
                                          input.amount.toString(),
                                          collateralToken.decimals
                                      )
                                  )
                                ? onFundProposal
                                : onApproveFunding
                        }
                    >
                        <Box gap="medium" pad={{ top: 'medium' }}>
                            <>
                                <Box
                                    direction="row"
                                    justify="between"
                                    align="end"
                                    pad={{ bottom: 'small' }}
                                >
                                    <Button
                                        disabled={disableButtons}
                                        icon={<ArrowLineUp />}
                                        onClick={inputMaxAmount}
                                    />
                                    <FormField
                                        margin={{ bottom: 'none' }}
                                        name="amount"
                                        label="Amount"
                                        type="number"
                                        required={
                                            !funding.eq(proposal.fundingGoal)
                                        }
                                        disabled={disableButtons}
                                    />
                                    <TokenAvatar token={collateralToken} />
                                </Box>
                            </>
                            <Box
                                height="3em"
                                justify="center"
                                align="center"
                                round="xsmall"
                                border
                                elevation="small"
                            >
                                {currentAllowance !== undefined &&
                                !currentAllowance.isZero() ? (
                                    <Box
                                        direction="row"
                                        gap="small"
                                        align="center"
                                    >
                                        <CheckCircle size="18" />
                                        <Text size="small">
                                            You have approved access to{' '}
                                            {Number(
                                                ethers.utils.formatUnits(
                                                    currentAllowance,
                                                    collateralToken.decimals
                                                )
                                            ).toFixed(2)}{' '}
                                            {collateralToken.symbol}
                                        </Text>
                                    </Box>
                                ) : funding.eq(proposal.fundingGoal) ? (
                                    <Box
                                        direction="row"
                                        gap="small"
                                        align="center"
                                    >
                                        <Info size="18" />
                                        <Text size="small">
                                            Proposal is fully funded
                                        </Text>
                                    </Box>
                                ) : (
                                    <Box
                                        direction="row"
                                        gap="small"
                                        align="center"
                                    >
                                        <Info size="18" />
                                        <Text size="small">
                                            Please approve transfer before
                                            funding
                                        </Text>
                                    </Box>
                                )}
                            </Box>
                            <Box direction="row" justify="between">
                                <LoaderButton
                                    isLoading={isInSecondaryTransaction}
                                    disabled={!isValidInput || disableButtons}
                                    secondary
                                    label="Defund"
                                    onClick={onDefundProposal}
                                />
                                {funding.eq(proposal.fundingGoal) ? (
                                    <LoaderButton
                                        isLoading={isInPrimaryTransaction}
                                        disabled={disableButtons}
                                        primary
                                        type="submit"
                                        label="Execute"
                                    />
                                ) : input.amount &&
                                  currentAllowance?.gte(
                                      ethers.utils.parseUnits(
                                          input.amount.toString(),
                                          collateralToken.decimals
                                      )
                                  ) ? (
                                    <LoaderButton
                                        isLoading={isInPrimaryTransaction}
                                        disabled={
                                            !isValidInput || disableButtons
                                        }
                                        primary
                                        type="submit"
                                        label="Fund"
                                    />
                                ) : (
                                    <LoaderButton
                                        isLoading={isInPrimaryTransaction}
                                        disabled={
                                            !isValidInput || disableButtons
                                        }
                                        primary
                                        type="submit"
                                        label="Approve"
                                    />
                                )}
                            </Box>
                        </Box>
                    </Form>
                </Box>
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['TOKEN']} />
            )}
            {errorMsg && (
                <ErrorPopupModal
                    onClose={() => setErrorMsg(undefined)}
                    errorMessage={errorMsg}
                />
            )}
        </>
    )
}

export default FundProposalForm
