import { ArrowLineUp, CheckCircle, Info } from 'phosphor-react'
import { BigNumber, ethers } from 'ethers'
import { Box, Button, Form, Text } from 'grommet'
import React, { useEffect, useRef, useState } from 'react'

import BaseTokenBadge from '@cambrian/app/components/token/BaseTokenBadge'
import ButtonRowContainer from '@cambrian/app/components/containers/ButtonRowContainer'
import { ERC20_IFACE } from 'packages/app/config/ContractInterfaces'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import FundingProgressMeter from '@cambrian/app/components/progressMeters/FundingProgressMeter'
import FundingSkeleton from '@cambrian/app/components/skeletons/FundingSkeleton'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import NumberInput from '@cambrian/app/components/inputs/NumberInput'
import Proposal from '@cambrian/app/classes/stages/Proposal'
import ProposalsHub from '@cambrian/app/hubs/ProposalsHub'
import { SUPPORTED_CHAINS } from 'packages/app/config/SupportedChains'
import TokenBridgeButton from '@cambrian/app/components/buttons/TokenBridgeButton'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useProposalFunding } from '@cambrian/app/hooks/useProposalFunding'

interface FundProposalFormProps {
    proposal: Proposal
    currentUser: UserType
}

type FundProposalFormType = {
    amount: number
}

const initialInput = {
    amount: 0,
}

const FundProposalForm = ({ proposal, currentUser }: FundProposalFormProps) => {
    const { funding } = useProposalFunding(proposal.onChainProposal.id)
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
    const [isApproving, setIsApproving] = useState(false)
    const [isFunding, setIsFunding] = useState(false)
    const [isDefunding, setIsDefunding] = useState(false)

    const [errorMsg, setErrorMsg] = useState<ErrorMessageType>()
    const [currentUserFunding, setCurrentUserFunding] = useState<BigNumber>(
        BigNumber.from(0)
    )

    const erc20TokenContract = new ethers.Contract(
        proposal.collateralToken.address,
        ERC20_IFACE,
        currentUser.signer
    )

    const approvalFilter = erc20TokenContract.filters.Approval(
        currentUser.address,
        proposal.onChainProposal.address,
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
                const max = proposal.onChainProposal.fundingGoal.sub(
                    await proposalsHub.getProposalFunding(
                        proposal.onChainProposal.id
                    )
                )
                if (BigNumber.from(allowanceWei).gt(max)) initInput = max

                setInput({
                    amount: Number(
                        ethers.utils.formatUnits(
                            initInput,
                            proposal.collateralToken.decimals
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
            Number(
                ethers.utils.formatUnits(
                    amount,
                    proposal.collateralToken.decimals
                )
            )
        ) {
            setCurrentAllowance(amount)
        }
        setIsApproving(false)
    }

    const init = async () => {
        await initAllowance()
        await updateUserFunding(proposal.onChainProposal.id)
    }

    const initProposalsHubListeners = async () => {
        proposalsHub.contract.on(
            proposalsHub.contract.filters.FundProposal(
                proposal.onChainProposal.id,
                null,
                null
            ),
            async (proposalId) => {
                setIsFunding(false)
                await initAllowance()
                await updateUserFunding(proposalId)
            }
        )

        proposalsHub.contract.on(
            proposalsHub.contract.filters.DefundProposal(
                proposal.onChainProposal.id,
                null,
                null
            ),
            async (proposalId) => {
                setIsDefunding(false)
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

    const onApproveFunding = async () => {
        setIsApproving(true)
        try {
            await proposal.approveFunding(input.amount)
        } catch (e) {
            setErrorMsg(await cpLogger.push(e))
            setIsApproving(false)
        }
    }

    const onFundProposal = async () => {
        setIsFunding(true)
        try {
            await proposal.fund(input.amount)
        } catch (e) {
            setErrorMsg(await cpLogger.push(e))
            setIsFunding(false)
        }
    }

    const onDefundProposal = async () => {
        setIsDefunding(true)
        try {
            await proposal.defund(input.amount)
        } catch (e) {
            setErrorMsg(await cpLogger.push(e))
            setIsDefunding(false)
        }
    }

    const inputMaxAmount = () => {
        if (funding?.eq(proposal.onChainProposal.fundingGoal)) {
            setInput({
                amount: Number(
                    ethers.utils.formatUnits(
                        currentUserFunding,
                        proposal.collateralToken.decimals
                    )
                ),
            })
        } else {
            const max = proposal.onChainProposal.fundingGoal.sub(funding)
            setInput({
                amount: Number(
                    ethers.utils.formatUnits(
                        max,
                        proposal.collateralToken.decimals
                    )
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
                    proposal.onChainProposal.fundingGoal,
                    proposal.collateralToken.decimals
                )
            )

    const disableButtons = isApproving || isDefunding || isFunding

    return (
        <>
            <Box align="center">
                {funding ? (
                    <>
                        <Box
                            width={{ min: 'medium' }}
                            flex
                            pad={{ bottom: 'medium' }}
                        >
                            <FundingProgressMeter
                                token={proposal.collateralToken}
                                funding={funding}
                                fundingGoal={
                                    proposal.onChainProposal.fundingGoal
                                }
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
                                    funding.eq(
                                        proposal.onChainProposal.fundingGoal
                                    )
                                        ? onDefundProposal
                                        : input.amount &&
                                          currentAllowance?.gte(
                                              ethers.utils.parseUnits(
                                                  input.amount.toString(),
                                                  proposal.collateralToken
                                                      .decimals
                                              )
                                          )
                                        ? onFundProposal
                                        : onApproveFunding
                                }
                            >
                                <Box gap="medium">
                                    <Box gap="medium">
                                        <Box
                                            direction="row"
                                            justify="between"
                                            align="center"
                                            gap="small"
                                            background="background-contrast"
                                            pad="small"
                                            round="xsmall"
                                        >
                                            <Button
                                                disabled={disableButtons}
                                                icon={<ArrowLineUp />}
                                                onClick={inputMaxAmount}
                                            />
                                            <Box flex>
                                                <NumberInput
                                                    name="amount"
                                                    required={
                                                        !funding.eq(
                                                            proposal
                                                                .onChainProposal
                                                                .fundingGoal
                                                        )
                                                    }
                                                    disabled={disableButtons}
                                                />
                                            </Box>
                                            <BaseTokenBadge
                                                token={proposal.collateralToken}
                                            />
                                        </Box>
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
                                                                proposal
                                                                    .collateralToken
                                                                    .decimals
                                                            )
                                                        ).toFixed(2)}{' '}
                                                        {
                                                            proposal
                                                                .collateralToken
                                                                .symbol
                                                        }
                                                    </Text>
                                                </Box>
                                            ) : funding.eq(
                                                  proposal.onChainProposal
                                                      .fundingGoal
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
                                    <ButtonRowContainer
                                        primaryButton={
                                            funding.eq(
                                                proposal.onChainProposal
                                                    .fundingGoal
                                            ) ? (
                                                <LoaderButton
                                                    isLoading={isDefunding}
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
                                                      proposal.collateralToken
                                                          .decimals
                                                  )
                                              ) ? (
                                                <LoaderButton
                                                    isLoading={isFunding}
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
                                                    isLoading={isApproving}
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
                                                proposal.onChainProposal
                                                    .fundingGoal
                                            ) ? undefined : (
                                                <LoaderButton
                                                    isLoading={isDefunding}
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
                                    {SUPPORTED_CHAINS[currentUser.chainId]
                                        .chainData.bridgeURI && (
                                        <Box pad="xsmall">
                                            <TokenBridgeButton
                                                chainId={currentUser.chainId}
                                            />
                                        </Box>
                                    )}
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
