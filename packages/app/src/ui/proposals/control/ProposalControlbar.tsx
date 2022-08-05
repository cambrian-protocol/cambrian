import { Box, Button } from 'grommet'

import FundProposalForm from '../forms/FundProposalForm'
import Link from 'next/link'
import { PencilCircle } from 'phosphor-react'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import ProposalExecutedControl from '@cambrian/app/ui/proposals/control/ProposalExecutedControl'
import ProposalReviewControl from './ProposalReviewControl'
import ProposalStartFundingControl from './ProposalStartFundingControl'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useProposalContext } from '@cambrian/app/hooks/useProposalContext'

const ProposalControlbar = () => {
    const { currentUser } = useCurrentUserContext()
    const { proposalStack, proposalStatus, proposalContract } =
        useProposalContext()

    const isProposalAuthor =
        currentUser?.selfID.did.id === proposalStack?.proposalDoc.content.author
    const isTemplateAuthor =
        currentUser?.selfID.did.id === proposalStack?.templateDoc.content.author

    const renderControls = () => {
        switch (proposalStatus) {
            case ProposalStatus.OnReview:
                return (
                    <>
                        {isTemplateAuthor && currentUser && (
                            <ProposalReviewControl currentUser={currentUser} />
                        )}
                    </>
                )
            case ProposalStatus.ChangeRequested:
                return (
                    <>
                        {isProposalAuthor && proposalStack && (
                            <Box gap="medium">
                                <PlainSectionDivider />
                                <Link
                                    href={`${
                                        window.location.origin
                                    }/dashboard/proposals/edit/${proposalStack.proposalDoc.id.toString()}`}
                                    passHref
                                >
                                    <Button
                                        icon={<PencilCircle />}
                                        label="Edit Proposal"
                                        primary
                                        size="small"
                                    />
                                </Link>
                            </Box>
                        )}
                    </>
                )
            case ProposalStatus.Approved:
                return <ProposalStartFundingControl />
            case ProposalStatus.Funding:
                return (
                    <>
                        {currentUser && proposalContract && (
                            <FundProposalForm
                                currentUser={currentUser}
                                proposal={proposalContract}
                            />
                        )}
                    </>
                )
            case ProposalStatus.Executed:
                return <ProposalExecutedControl />
            default:
                return <></>
        }
    }

    return <>{renderControls()}</>
}

export default ProposalControlbar
