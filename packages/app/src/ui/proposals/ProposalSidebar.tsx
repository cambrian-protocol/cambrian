import React, { SetStateAction, useEffect, useState } from 'react'

import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import { Button } from 'grommet'
import FundProposalForm from './forms/FundProposalForm'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import IPFSSolutionsHub from '@cambrian/app/hubs/IPFSSolutionsHub'
import Link from 'next/link'
import ProposalsHub from '@cambrian/app/hubs/ProposalsHub'
import SidebarComponentContainer from '@cambrian/app/components/containers/SidebarComponentContainer'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ethers } from 'ethers'

interface ProposalSidebarProps {
    isProposalExecuted?: boolean
    setIsProposalExecuted: React.Dispatch<SetStateAction<boolean>>
    proposal: ethers.Contract
    proposalsHub: ProposalsHub
    currentUser: UserType
}

const ProposalSidebar = ({
    proposalsHub,
    proposal,
    currentUser,
    isProposalExecuted,
    setIsProposalExecuted,
}: ProposalSidebarProps) => {
    const [firstSolverAddress, setFirstSolverAddress] = useState<string>()

    useEffect(() => {
        if (isProposalExecuted) {
            initSolver()
        }
    }, [isProposalExecuted])

    const initSolver = async () => {
        if (currentUser.chainId && currentUser.signer) {
            try {
                const ipfsSolutionsHub = new IPFSSolutionsHub(
                    currentUser.signer,
                    currentUser.chainId
                )
                const solvers = await ipfsSolutionsHub.getSolvers(
                    proposal.solutionId
                )
                if (!solvers) throw GENERAL_ERROR['NO_SOLVERS_FOUND']
                setFirstSolverAddress(solvers[0])
            } catch (e) {
                cpLogger.push(e)
            }
        }
    }

    return (
        <BaseFormGroupContainer
            groupTitle="Status"
            border
            pad={{ horizontal: 'medium' }}
        >
            {isProposalExecuted && firstSolverAddress ? (
                <SidebarComponentContainer
                    title="Interaction"
                    description="This Proposal has been funded and executed. To start
                    working with this Solution visit the first Solver"
                >
                    <Link href={`/solvers/${firstSolverAddress}`} passHref>
                        <Button primary size="small" label="Go to Solver" />
                    </Link>
                </SidebarComponentContainer>
            ) : (
                <SidebarComponentContainer
                    title="Fund this Proposal"
                    description="If you agree to the conditions, you can approve access to the agreed token and fund this proposal. You can withdraw your invested funds anytime before the proposal has been executed."
                >
                    <FundProposalForm
                        currentUser={currentUser}
                        proposalsHub={proposalsHub}
                        proposal={proposal}
                        setIsProposalExecuted={setIsProposalExecuted}
                    />
                </SidebarComponentContainer>
            )}
        </BaseFormGroupContainer>
    )
}

export default ProposalSidebar
