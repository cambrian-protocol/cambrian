import React, { useEffect, useState } from 'react'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import { BigNumber } from 'ethers'
import { Box } from 'grommet'
import FundProposalForm from './forms/FundProposalForm'
import FundingProgressMeter from '@cambrian/app/components/progressMeters/FundingProgressMeter'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { SolutionModel } from '@cambrian/app/models/SolutionModel'
import { formatDecimals } from '@cambrian/app/utils/helpers/tokens'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useProposalsHub } from '@cambrian/app/hooks/useProposalsHub'

interface FundProposalUIProps {
    currentFunding: BigNumber
    proposal: ProposalModel
    solution: SolutionModel
}

const FundProposalUI = ({
    proposal,
    solution,
    currentFunding,
}: FundProposalUIProps) => {
    const { currentUser } = useCurrentUser()
    const [isInTransaction, setIsInTransaction] = useState(false)
    const { fundProposal, defundProposal } = useProposalsHub()

    const [currentFundingNumber, setCurrentFundingNumber] = useState<number>(0)
    const [fundingGoal, setFundingGoal] = useState<number>(0)

    useEffect(() => {
        setCurrentFundingNumber(
            formatDecimals(
                solution.collateralToken,
                BigNumber.from(currentFunding)
            )
        )
        setFundingGoal(
            formatDecimals(
                solution.collateralToken,
                BigNumber.from(proposal.amount)
            )
        )
    }, [])

    // TODO remove Loading if transaction rejected
    const onFundProposal = async (amount: number) => {
        if (currentUser) {
            setIsInTransaction(true)
            try {
                await fundProposal(
                    proposal.id,
                    solution.collateralToken.address,
                    amount,
                    currentUser
                )
            } catch (e) {
                console.log(e)
            }

            setIsInTransaction(false)
        }
    }

    const onDefundProposal = async (amount: number) => {
        if (currentUser) {
            setIsInTransaction(true)
            await defundProposal(
                proposal.id,
                solution.collateralToken.address,
                amount,
                currentUser
            )
            setIsInTransaction(false)
        }
    }

    return (
        <>
            <HeaderTextSection
                title="Fund this proposal"
                subTitle="Proposal funding description"
                paragraph={
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis.'
                }
            />
            <BaseFormContainer gap="medium">
                <FundingProgressMeter
                    funding={currentFundingNumber}
                    fundingGoal={fundingGoal}
                />
                <Box fill>
                    <FundProposalForm
                        onFundProposal={onFundProposal}
                        onDefundProposal={onDefundProposal}
                        token={solution.collateralToken}
                    />
                </Box>
            </BaseFormContainer>
            <Box pad="medium" />
            {isInTransaction && (
                <LoadingScreen context="Please confirm this transaction" />
            )}
        </>
    )
}

export default FundProposalUI
