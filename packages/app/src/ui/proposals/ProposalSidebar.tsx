import { Box, Button, Text } from 'grommet'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import FundProposalForm from './forms/FundProposalForm'
import Link from 'next/link'
import Messenger from '@cambrian/app/components/messenger/Messenger'
import ProposalDraftSidebar from '@cambrian/app/components/bars/sidebar/proposal/ProposalDraftSidebar'
import ProposalExecutedSidebar from '@cambrian/app/components/bars/sidebar/proposal/ProposalExecutedSidebar'
import ProposalReviewSidebar from '@cambrian/app/components/bars/sidebar/proposal/ProposalReviewSidebar'
import ProposalStartFundingComponent from '@cambrian/app/components/bars/sidebar/proposal/ProposalStartFundingComponent'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import React from 'react'
import _ from 'lodash'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useProposal } from '@cambrian/app/hooks/useProposal'

const ProposalSidebar = () => {
    const { currentUser } = useCurrentUser()
    const {
        proposalStatus,
        proposalStack,
        proposalStreamDoc,
        proposalContract,
    } = useProposal()

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
            case ProposalStatus.Funding:
                return (
                    <>
                        {currentUser && proposalContract && (
                            <BaseFormGroupContainer
                                border
                                pad="medium"
                                gap="medium"
                            >
                                <FundProposalForm
                                    currentUser={currentUser}
                                    proposal={proposalContract}
                                />
                            </BaseFormGroupContainer>
                        )}
                    </>
                )
            case ProposalStatus.Executed:
                return <ProposalExecutedSidebar />
            default:
                return <></>
        }
    }

    return (
        <>
            {currentUser && (
                <Box gap="medium">
                    {renderControls()}
                    {(isProposalAuthor || isTemplateAuthor) &&
                        proposalStack &&
                        proposalStreamDoc && (
                            <BaseFormContainer pad="medium" gap="medium">
                                <Messenger
                                    currentUser={currentUser}
                                    chatID={proposalStreamDoc.id.toString()}
                                    chatType={
                                        proposalStatus ===
                                            ProposalStatus.Funding ||
                                        proposalStatus ===
                                            ProposalStatus.Executed
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
