import { Box, Button } from 'grommet'
import React, { useEffect, useState } from 'react'

import FundProposalForm from './forms/FundProposalForm'
import FundingProgressMeter from '@cambrian/app/components/progressMeters/FundingProgressMeter'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'

interface WriterFundingProps {
    proposal: ProposalModel
}

const FundProposal = ({ proposal }: WriterFundingProps) => {
    const [currentFunds, setCurrentFunds] = useState<number>(0)

    useEffect(() => {
        fetchCurrentFunds()
    }, [])

    const fetchCurrentFunds = async () => {
        // Fetch current funds
        /* 
        TODO Fetch current funds
        collateralBalance()
        */
        const fetchedCurrentFunds = 10000
        setCurrentFunds(fetchedCurrentFunds)
    }

    const onExecuteProposal = () => {
        /* 
        TODO  Execute proposal
        Fetch solverconfigs through proposal.solutionId
        await this.ProposalsHub.connect(this.keeper).executeIPFSProposal(
            proposalId,
            solverConfigs
        );
        */
    }

    return (
        <>
            {!(currentFunds >= proposal.amount) ? (
                <>
                    <HeaderTextSection
                        title="Fund this proposal"
                        subTitle="Proposal funding description"
                        paragraph={
                            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis.'
                        }
                    />
                    <FundingProgressMeter
                        current={currentFunds}
                        total={proposal.amount}
                    />
                    <Box fill>
                        <FundProposalForm
                            token={proposal.solution.collateralToken}
                        />
                    </Box>
                </>
            ) : (
                <>
                    <HeaderTextSection
                        title="Deploy this proposal"
                        subTitle="Proposal funding description"
                        paragraph={
                            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis.'
                        }
                    />
                    <Box fill>
                        <Button
                            primary
                            label="Deploy Proposal"
                            onClick={() => onExecuteProposal()}
                        />
                    </Box>
                </>
            )}
        </>
    )
}

export default FundProposal
