import React, { useState } from 'react'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import { Box } from 'grommet'
import FundProposalForm from './forms/FundProposalForm'
import FundingProgressMeter from '@cambrian/app/components/progressMeters/FundingProgressMeter'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { SolutionModel } from '@cambrian/app/models/SolutionModel'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useProposalsHub } from '@cambrian/app/hooks/useProposalsHub'

interface FundProposalUIProps {
    currentFunding: number
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

    // TODO remove Loading if transaction rejected
    const onFundProposal = async (amount: number) => {
        if (currentUser) {
            setIsInTransaction(true)
            await fundProposal(
                proposal.id,
                solution.collateralToken.address,
                amount,
                currentUser
            )
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
                    funding={currentFunding}
                    fundingGoal={proposal.amount}
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
