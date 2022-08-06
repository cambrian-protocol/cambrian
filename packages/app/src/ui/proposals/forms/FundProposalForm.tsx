import { ArrowLineUp, CheckCircle, Info } from 'phosphor-react'
import { BigNumber, ethers } from 'ethers'
import { Box, Button, Form, FormField, Heading, Spinner, Text } from 'grommet'
import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'
import React, { SetStateAction, useEffect, useRef, useState } from 'react'

import CeramicStagehand from '@cambrian/app/classes/CeramicStagehand'
import { ERC20_IFACE } from 'packages/app/config/ContractInterfaces'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import FundingProgressMeter from '@cambrian/app/components/progressMeters/FundingProgressMeter'
import IPFSSolutionsHub from '@cambrian/app/hubs/IPFSSolutionsHub'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import ProposalsHub from '@cambrian/app/hubs/ProposalsHub'
import { SolverConfigModel } from '@cambrian/app/models/SolverConfigModel'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { TokenAPI } from '@cambrian/app/services/api/Token.api'
import TokenAvatar from '@cambrian/app/components/avatars/TokenAvatar'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'

interface FundProposalFormProps {
    proposal: ethers.Contract
    currentUser: UserType
}

type FundProposalFormType = {
    amount: number
}

const initialInput = {
    amount: 0,
}

const FundProposalForm = ({ proposal, currentUser }: FundProposalFormProps) => {
    const [input, _setInput] = useState<FundProposalFormType>(initialInput)

    // Necessary to access amount state in approvalListener
    const inputRef = useRef(input)
    const setInput = (newInput: FundProposalFormType) => {
        inputRef.current = newInput
        _setInput(newInput)
    }

    const proposalsHub = new ProposalsHub(
        currentUser.signer,
        currentUser.chainId
    )
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

                // Init input with allowance but maximum the amount which is left
                let initInput = allowanceWei
                const max = proposal.fundingGoal.sub(
                    await proposalsHub.getProposalFunding(proposal.id)
                )
                if (BigNumber.from(allowanceWei).gt(max)) initInput = max

                setInput({
                    amount: Number(
                        ethers.utils.formatUnits(
                            initInput,
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
                await updateUserFunding(proposalId)
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
                await updateUserFunding(proposalId)
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
                    const cs = new CeramicStagehand(currentUser.selfID)
                    const ceramicSolverConfigs = (await cs.loadTileDocument(
                        solution.solverConfigsURI
                    )) as TileDocument<{ solverConfigs: SolverConfigModel[] }>

                    await proposalsHub.executeProposal(
                        proposal.id,
                        ceramicSolverConfigs.content.solverConfigs
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
            <Box gap="medium">
                <PlainSectionDivider />
                <>
                    <Heading level="3">Back this Proposal</Heading>
                    <Text color="dark-4" size="small">
                        Invested funds can be defunded until the proposal has
                        been executed
                    </Text>
                </>
                <Box
                    align="center"
                    justify="around"
                    direction="row"
                    wrap={'reverse'}
                >
                    {collateralToken ? (
                        <>
                            <Box
                                width="medium"
                                border
                                round="xsmall"
                                pad="medium"
                            >
                                <Form<FundProposalFormType>
                                    onChange={(
                                        nextValue: FundProposalFormType
                                    ) => {
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
                                    <Box gap="medium">
                                        <Box pad="xsmall" gap="medium">
                                            <>
                                                <Box
                                                    direction="row"
                                                    justify="between"
                                                    pad={{ bottom: 'small' }}
                                                    align="end"
                                                    gap="small"
                                                >
                                                    <Button
                                                        disabled={
                                                            disableButtons
                                                        }
                                                        icon={<ArrowLineUp />}
                                                        onClick={inputMaxAmount}
                                                        label="Max"
                                                        size="small"
                                                        secondary
                                                    />
                                                    <Box flex>
                                                        <FormField
                                                            margin={{
                                                                bottom: 'none',
                                                            }}
                                                            name="amount"
                                                            label="Amount"
                                                            type="number"
                                                            required={
                                                                !funding.eq(
                                                                    proposal.fundingGoal
                                                                )
                                                            }
                                                            disabled={
                                                                disableButtons
                                                            }
                                                        />
                                                    </Box>
                                                    <TokenAvatar
                                                        token={collateralToken}
                                                    />
                                                </Box>
                                            </>
                                            <Box
                                                justify="center"
                                                align="center"
                                                round="xsmall"
                                                border
                                                elevation="small"
                                                pad="small"
                                            >
                                                {currentAllowance !==
                                                    undefined &&
                                                !currentAllowance.isZero() ? (
                                                    <Box
                                                        direction="row"
                                                        gap="small"
                                                        align="center"
                                                    >
                                                        <CheckCircle size="18" />
                                                        <Text size="small">
                                                            You have approved
                                                            access to{' '}
                                                            {Number(
                                                                ethers.utils.formatUnits(
                                                                    currentAllowance,
                                                                    collateralToken.decimals
                                                                )
                                                            ).toFixed(2)}{' '}
                                                            {
                                                                collateralToken.symbol
                                                            }
                                                        </Text>
                                                    </Box>
                                                ) : funding.eq(
                                                      proposal.fundingGoal
                                                  ) ? (
                                                    <Box
                                                        direction="row"
                                                        gap="small"
                                                        align="center"
                                                    >
                                                        <Info size="18" />
                                                        <Text size="small">
                                                            Proposal is fully
                                                            funded
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
                                                            Please approve
                                                            transfer before
                                                            funding
                                                        </Text>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                        <TwoButtonWrapContainer
                                            primaryButton={
                                                funding.eq(
                                                    proposal.fundingGoal
                                                ) ? (
                                                    <LoaderButton
                                                        isLoading={
                                                            isInPrimaryTransaction
                                                        }
                                                        disabled={
                                                            disableButtons
                                                        }
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
                                                        isLoading={
                                                            isInPrimaryTransaction
                                                        }
                                                        disabled={
                                                            !isValidInput ||
                                                            disableButtons
                                                        }
                                                        primary
                                                        type="submit"
                                                        label="Fund"
                                                    />
                                                ) : (
                                                    <LoaderButton
                                                        isLoading={
                                                            isInPrimaryTransaction
                                                        }
                                                        disabled={
                                                            !isValidInput ||
                                                            disableButtons
                                                        }
                                                        primary
                                                        type="submit"
                                                        label="Approve"
                                                    />
                                                )
                                            }
                                            secondaryButton={
                                                <LoaderButton
                                                    isLoading={
                                                        isInSecondaryTransaction
                                                    }
                                                    disabled={
                                                        !isValidInput ||
                                                        disableButtons
                                                    }
                                                    secondary
                                                    label="Defund"
                                                    onClick={onDefundProposal}
                                                />
                                            }
                                        />
                                    </Box>
                                </Form>
                            </Box>
                            <Box
                                width={{ min: 'medium' }}
                                flex
                                pad={{ bottom: 'medium' }}
                            >
                                <FundingProgressMeter
                                    token={collateralToken}
                                    funding={funding}
                                    fundingGoal={proposal.fundingGoal}
                                    userFunding={currentUserFunding}
                                />
                            </Box>
                        </>
                    ) : (
                        <Spinner />
                    )}
                </Box>
            </Box>
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
