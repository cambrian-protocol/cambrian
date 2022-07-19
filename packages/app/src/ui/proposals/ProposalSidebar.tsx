import { Box, Button, Text } from 'grommet'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import Link from 'next/link'
import Messenger from '@cambrian/app/components/messenger/Messenger'
import ProposalDraftSidebar from '@cambrian/app/components/bars/sidebar/proposal/ProposalDraftSidebar'
import ProposalReviewSidebar from '@cambrian/app/components/bars/sidebar/proposal/ProposalReviewSidebar'
import ProposalStartFundingComponent from '@cambrian/app/components/bars/sidebar/proposal/ProposalStartFundingComponent'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import React from 'react'
import _ from 'lodash'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useProposal } from '@cambrian/app/hooks/useProposal'

const ProposalSidebar = () => {
    const { currentUser } = useCurrentUser()
    const { proposalStatus, proposalStack, proposalStreamDoc } = useProposal()

    const isProposalAuthor =
        currentUser?.selfID.did.id === proposalStack?.proposal.author
    const isTemplateAuthor =
        currentUser?.selfID.did.id === proposalStack?.template.author

    const renderControls = () => {
        switch (proposalStatus) {
            case ProposalStatus.Draft:
                return <>{isProposalAuthor && <ProposalDraftSidebar />}</>
            case ProposalStatus.OnReview:
                return <>{isTemplateAuthor && <ProposalReviewSidebar />}</>
            case ProposalStatus.ChangeRequested:
                return (
                    <>
                        {isProposalAuthor && proposalStreamDoc && (
                            <BaseFormGroupContainer
                                border
                                pad="medium"
                                gap="medium"
                            >
                                <Text>Edit your proposal</Text>
                                <Link
                                    href={`${
                                        window.location.origin
                                    }/dashboard/proposals/edit/${proposalStreamDoc.id.toString()}`}
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
                return <ProposalStartFundingComponent />
            default:
                return <></>
        }
    }

    return (
        <>
            {proposalStreamDoc && currentUser && (
                <Box gap="medium">
                    {renderControls()}
                    {(isProposalAuthor || isTemplateAuthor) && proposalStack && (
                        <BaseFormContainer pad="medium" gap="medium">
                            <Messenger
                                currentUser={currentUser}
                                chatID={proposalStreamDoc.id.toString()}
                                chatType={
                                    proposalStatus === ProposalStatus.Funding ||
                                    proposalStatus === ProposalStatus.Executed
                                        ? 'Proposal'
                                        : 'Draft'
                                }
                            />
                        </BaseFormContainer>
                    )}
                </Box>
            )}
        </>
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
