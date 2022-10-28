import { ArrowLineUp, CheckCircle, Info } from 'phosphor-react'
import { BigNumber, ethers } from 'ethers'
import { Box, Button, Form, FormField, Text } from 'grommet'
import React, { SetStateAction, useEffect, useRef, useState } from 'react'

import { ERC20_IFACE } from 'packages/app/config/ContractInterfaces'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import FundingProgressMeter from '@cambrian/app/components/progressMeters/FundingProgressMeter'
import FundingSkeleton from '@cambrian/app/components/skeletons/FundingSkeleton'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import ProposalsHub from '@cambrian/app/hubs/ProposalsHub'
import { TokenAPI } from '@cambrian/app/services/api/Token.api'
import TokenAvatar from '@cambrian/app/components/avatars/TokenAvatar'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useProposalFunding } from '@cambrian/app/hooks/useProposalFunding'

interface FundProposalFormProps {
    proposalContract: ethers.Contract
    currentUser: UserType
}

type FundProposalFormType = {
    amount: number
}

const initialInput = {
    amount: 0,
}

const FundProposalForm = ({
    proposalContract,
    currentUser,
}: FundProposalFormProps) => {
    const { funding } = useProposalFunding(proposalContract.id)
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
        proposalContract.collateralToken,
        ERC20_IFACE,
        currentUser.signer
    )

    const approvalFilter = erc20TokenContract.filters.Approval(
        currentUser.address,
        proposalContract.address,
        null
    )
    useEffect(() => {
        init()
    }, [])

    useEffect(() => {
        initProposalsHubListeners()
        erc20TokenContract.on(approvalFilter, approvalListener)
        return () => {
            proposalsHub.contract.removeAllListeners()
            erc20TokenContract.removeListener(approvalFilter, approvalListener)
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
                const max = proposalContract.fundingGoal.sub(
                    await proposalsHub.getProposalFunding(proposalContract.id)
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

    const init = async () => {
        const token = await TokenAPI.getTokenInfo(
            proposalContract.collateralToken,
            currentUser.web3Provider
        )
        setCollateralToken(token)
        await initAllowance()
        await updateUserFunding(proposalContract.id)
    }

    const initProposalsHubListeners = async () => {
        proposalsHub.contract.on(
            proposalsHub.contract.filters.FundProposal(
                proposalContract.id,
                null,
                null
            ),
            async (proposalId) => {
                setIsInPrimaryTransaction(false)
                await initAllowance()
                await updateUserFunding(proposalId)
            }
        )

        proposalsHub.contract.on(
            proposalsHub.contract.filters.DefundProposal(
                proposalContract.id,
                null,
                null
            ),
            async (proposalId) => {
                // Can be both - Secondary or primary in case proposal is fully funded
                setIsInPrimaryTransaction(false)
                setIsInSecondaryTransaction(false)
                await initAllowance()
                await updateUserFunding(proposalId)
            }
        )
    }

    const updateUserFunding = async (proposalId: string) => {
        const userFunding = await proposalsHub.contract.funderAmountMap(
            proposalId,
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
                    proposalContract.id,
                    input.amount,
                    collateralToken
                ),
            setIsInPrimaryTransaction
        )
    }

    const onDefundProposal = async () => {
        if (funding?.eq(proposalContract.fundingGoal)) {
            safeTransactionCall(
                () =>
                    proposalsHub.defundProposal(
                        proposalContract.id,
                        input.amount,
                        collateralToken
                    ),
                setIsInPrimaryTransaction
            )
        } else {
            safeTransactionCall(
                () =>
                    proposalsHub.defundProposal(
                        proposalContract.id,
                        input.amount,
                        collateralToken
                    ),
                setIsInSecondaryTransaction
            )
        }
    }

    const inputMaxAmount = () => {
        if (funding?.eq(proposalContract.fundingGoal)) {
            setInput({
                amount: Number(
                    ethers.utils.formatUnits(
                        currentUserFunding,
                        collateralToken?.decimals
                    )
                ),
            })
        } else {
            const max = proposalContract.fundingGoal.sub(funding)
            setInput({
                amount: Number(
                    ethers.utils.formatUnits(max, collateralToken?.decimals)
                ),
            })
        }
    }

    const isValidInput =
        typeof input.amount != 'undefined' &&
        input.amount &&
        input.amount > 0 &&
        input.amount <=
            Number(
                ethers.utils.formatUnits(
                    proposalContract.fundingGoal,
                    collateralToken?.decimals
                )
            )

    const disableButtons = isInPrimaryTransaction || isInSecondaryTransaction

    return (
        <>
            <Box align="center">
                {funding && collateralToken ? (
                    <>
                        <Box
                            width={{ min: 'medium' }}
                            flex
                            pad={{ bottom: 'medium' }}
                        >
                            <FundingProgressMeter
                                token={collateralToken}
                                funding={funding}
                                fundingGoal={proposalContract.fundingGoal}
                                userFunding={currentUserFunding}
                            />
                        </Box>
                        <Box width="medium">
                            <Form<FundProposalFormType>
                                onChange={(nextValue: FundProposalFormType) => {
                                    setInput(nextValue)
                                }}
                                value={input}
                                onSubmit={
                                    funding.eq(proposalContract.fundingGoal)
                                        ? onDefundProposal
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
                                                pad={{
                                                    bottom: 'small',
                                                }}
                                                align="end"
                                                gap="small"
                                            >
                                                <Button
                                                    disabled={disableButtons}
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
                                                                proposalContract.fundingGoal
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
                                            {currentAllowance !== undefined &&
                                            !currentAllowance.isZero() ? (
                                                <Box
                                                    direction="row"
                                                    gap="small"
                                                    align="center"
                                                >
                                                    <CheckCircle size="18" />
                                                    <Text size="small">
                                                        You have approved access
                                                        to{' '}
                                                        {Number(
                                                            ethers.utils.formatUnits(
                                                                currentAllowance,
                                                                collateralToken.decimals
                                                            )
                                                        ).toFixed(2)}{' '}
                                                        {collateralToken.symbol}
                                                    </Text>
                                                </Box>
                                            ) : funding.eq(
                                                  proposalContract.fundingGoal
                                              ) ? (
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
                                                        Please approve transfer
                                                        before funding
                                                    </Text>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                    <TwoButtonWrapContainer
                                        primaryButton={
                                            funding.eq(
                                                proposalContract.fundingGoal
                                            ) ? (
                                                <LoaderButton
                                                    isLoading={
                                                        isInPrimaryTransaction
                                                    }
                                                    disabled={
                                                        !isValidInput ||
                                                        disableButtons
                                                    }
                                                    secondary
                                                    label="Defund"
                                                    onClick={onDefundProposal}
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
                                            funding.eq(
                                                proposalContract.fundingGoal
                                            ) ? undefined : (
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
                                            )
                                        }
                                    />
                                </Box>
                            </Form>
                        </Box>
                    </>
                ) : (
                    <FundingSkeleton />
                )}
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
