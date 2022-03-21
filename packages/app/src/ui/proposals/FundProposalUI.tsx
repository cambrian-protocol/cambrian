import React, { useContext, useEffect, useState } from 'react'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import { BigNumber } from 'ethers'
import { Box } from 'grommet'
import FundProposalForm from './forms/FundProposalForm'
import FundingProgressMeter from '@cambrian/app/components/progressMeters/FundingProgressMeter'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { IPFSSolutionsHubContext } from '@cambrian/app/store/IPFSSolutionsHubContext'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useProposalsHub } from '@cambrian/app/hooks/useProposalsHub'
import { useRouter } from 'next/router'

interface FundProposalUIProps {
    proposalCID: string
    proposal: ProposalModel
}

const FundProposalUI = ({ proposal, proposalCID }: FundProposalUIProps) => {
    const { currentUser } = useCurrentUser()
    const [isInTransaction, setIsInTransaction] = useState(false)
    const router = useRouter()

    const {
        contract,
        approveFunding,
        fundProposal,
        defundProposal,
        executeProposal,
        getProposalFunding,
        getProposal,
    } = useProposalsHub()
    const ipfsSolutionsHub = useContext(IPFSSolutionsHubContext).contract

    const [currentFunding, setCurrentFunding] = useState(BigNumber.from(0))
    const [fundingGoal, setFundingGoal] = useState(BigNumber.from(0))

    useEffect(() => {
        fetchFunding()
    }, [])

    useEffect(() => {
        initListeners()
    }, [contract])

    const fetchFunding = async () => {
        // Fetch funding
        const proposalFunding = await getProposalFunding(proposal.id)
        if (proposalFunding) {
            setCurrentFunding(BigNumber.from(proposalFunding))
            setFundingGoal(BigNumber.from(proposal.amount))
        }
    }

    const initListeners = () => {
        if (contract) {
            contract.on(
                contract.filters.FundProposal(null, null, null),
                async (proposalId) => {
                    const proposalFunding = await getProposalFunding(proposalId)
                    if (proposalFunding) {
                        setCurrentFunding(proposalFunding)
                        setIsInTransaction(false)
                    }
                }
            )

            contract.on(
                contract.filters.DefundProposal(null, null, null),
                async (proposalId) => {
                    const proposalFunding = await getProposalFunding(proposalId)
                    if (proposalFunding) {
                        setCurrentFunding(proposalFunding)
                        setIsInTransaction(false)
                    }
                }
            )

            contract.on(
                contract.filters.ExecuteProposal(null),
                async (proposalId) => {
                    if (ipfsSolutionsHub) {
                        const proposal = await getProposal(proposalId)
                        if (proposal) {
                            const solvers = await ipfsSolutionsHub.getSolvers(
                                proposal.solutionId
                            )
                            if (solvers && solvers.length) {
                                router.push(
                                    `/proposals/${proposalCID}/solvers/${solvers[0]}`
                                )
                            }
                        }
                    }
                }
            )
        }
    }

    const onFundProposal = async (amount: number): Promise<boolean> => {
        if (currentUser) {
            try {
                setIsInTransaction(true)
                await fundProposal(
                    proposal.id,
                    proposal.solution.collateralToken.address,
                    amount,
                    currentUser
                )
                return true
            } catch (err) {
                console.error(err)
                setIsInTransaction(false)
            }
        }
        return false
    }

    // TODO Tokencontract approve listener
    const onApproveFunding = async (amount: number): Promise<boolean> => {
        if (currentUser) {
            try {
                setIsInTransaction(true)
                const approved = await approveFunding(
                    proposal.solution.collateralToken.address,
                    amount,
                    currentUser
                )
                setIsInTransaction(false)
                return !!approved
            } catch (e) {
                console.log(e)
            }
        }
        setIsInTransaction(false)
        return false
    }

    const onDefundProposal = async (amount: number) => {
        if (currentUser) {
            try {
                setIsInTransaction(true)
                await defundProposal(
                    proposal.id,
                    proposal.solution.collateralToken.address,
                    amount,
                    currentUser
                )
                return true
            } catch (err) {
                console.error(err)
            }
        }
        setIsInTransaction(false)
        return false
    }

    const onExecuteProposal = async () => {
        if (currentUser) {
            try {
                setIsInTransaction(true)
                return await executeProposal(
                    proposal.id,
                    proposal.solution.solverConfigs,
                    currentUser
                )
            } catch (err) {
                console.error(err)
            }
        }
        setIsInTransaction(false)
    }

    return (
        <>
            <HeaderTextSection
                title={
                    currentFunding.eq(fundingGoal)
                        ? 'Proposal ready to execute'
                        : 'Fund this proposal'
                }
                subTitle="Proposal funding"
            />
            <BaseFormContainer gap="medium">
                <BaseFormGroupContainer>
                    <FundingProgressMeter
                        token={proposal.solution.collateralToken}
                        funding={currentFunding}
                        fundingGoal={fundingGoal}
                    />
                </BaseFormGroupContainer>
                <FundProposalForm
                    onExecuteProposal={onExecuteProposal}
                    isFunded={currentFunding.eq(fundingGoal)}
                    onFundProposal={onFundProposal}
                    onApproveFunding={onApproveFunding}
                    onDefundProposal={onDefundProposal}
                    token={proposal.solution.collateralToken}
                />
            </BaseFormContainer>
            <Box pad="medium" />
            {isInTransaction && (
                <LoadingScreen context="Please confirm this transaction" />
            )}
        </>
    )
}

export default FundProposalUI
