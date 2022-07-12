import { Box, Button, Text } from 'grommet'
import React, { useState } from 'react'

import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import Link from 'next/link'
import ProposalDraftSidebar from '@cambrian/app/components/bars/sidebar/proposal/ProposalDraftSidebar'
import ProposalReviewSidebar from '@cambrian/app/components/bars/sidebar/proposal/ProposalReviewSidebar'
import ProposalStartFundingComponent from '@cambrian/app/components/bars/sidebar/proposal/ProposalStartFundingComponent'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import ProposalsHub from '@cambrian/app/hubs/ProposalsHub'
import { UserType } from '@cambrian/app/store/UserContext'
import _ from 'lodash'
import { ethers } from 'ethers'

interface ProposalSidebarProps {
    ceramicTemplate?: CeramicTemplateModel
    ceramicProposal?: CeramicProposalModel
    proposalStatus: ProposalStatus
    currentUser: UserType
    proposalStreamID: string
    proposalContract?: ethers.Contract
    proposalsHub?: ProposalsHub
    updateProposal: () => Promise<void>
}

const ProposalSidebar = ({
    ceramicTemplate,
    ceramicProposal,
    proposalStatus,
    currentUser,
    proposalStreamID,
    updateProposal,
}: ProposalSidebarProps) => {
    const [firstSolverAddress, setFirstSolverAddress] = useState<string>()

    /* useEffect(() => {
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
    } */

    //
    const renderControlls = () => {
        switch (proposalStatus) {
            case ProposalStatus.Draft:
                return (
                    <ProposalDraftSidebar
                        updateProposal={updateProposal}
                        currentUser={currentUser}
                        proposalStreamID={proposalStreamID}
                    />
                )
            case ProposalStatus.OnReview:
                return (
                    <>
                        {currentUser.selfID.did.id ===
                            ceramicTemplate?.author && (
                            <ProposalReviewSidebar
                                currentUser={currentUser}
                                proposalStreamID={proposalStreamID}
                                updateProposal={updateProposal}
                            />
                        )}
                    </>
                )
            case ProposalStatus.ChangeRequested:
                return (
                    <>
                        {currentUser.selfID.did.id ===
                            ceramicProposal?.author && (
                            <BaseFormGroupContainer
                                border
                                pad="medium"
                                gap="medium"
                            >
                                <Text>Edit your proposal</Text>
                                <Link
                                    href={`${window.location.origin}/dashboard/proposals/edit/${proposalStreamID}`}
                                    passHref
                                >
                                    <Button
                                        label="Edit Proposal"
                                        primary
                                        size="small"
                                    />
                                </Link>
                            </BaseFormGroupContainer>
                        )}
                    </>
                )
            case ProposalStatus.Approved:
                return (
                    <>
                        {ceramicProposal && ceramicTemplate && (
                            <ProposalStartFundingComponent
                                proposalStreamID={proposalStreamID}
                                currentUser={currentUser}
                                ceramicProposal={ceramicProposal}
                                ceramicTemplate={ceramicTemplate}
                            />
                        )}
                    </>
                )
            default:
                return <></>
        }
    }

    return (
        <Box gap="medium">
            {renderControlls()}
            <BaseFormGroupContainer border pad="medium" gap="medium">
                <Text>Messenger Placeholder</Text>
            </BaseFormGroupContainer>
        </Box>
    )
}

export default ProposalSidebar

/*  {isProposalExecuted && firstSolverAddress ? (
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
                    )} */
