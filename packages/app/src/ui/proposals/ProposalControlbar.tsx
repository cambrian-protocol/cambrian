import { Box, Button } from 'grommet'

import FundProposalForm from './forms/FundProposalForm'
import Link from 'next/link'
import { PencilCircle } from 'phosphor-react'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import ProposalExecutedControl from '@cambrian/app/components/bars/sidebar/proposal/ProposalExecutedControl'
import ProposalReviewControl from '@cambrian/app/components/bars/sidebar/proposal/ProposalReviewControl'
import ProposalStartFundingControl from '@cambrian/app/components/bars/sidebar/proposal/ProposalStartFundingControl'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useProposalContext } from '@cambrian/app/hooks/useProposalContext'

const ProposalControlbar = () => {
    const { currentUser } = useCurrentUser()
    const {
        proposalStack,
        proposalStatus,
        proposalStreamDoc,
        proposalContract,
    } = useProposalContext()

    const isProposalAuthor =
        currentUser?.selfID.did.id === proposalStack?.proposal.author
    const isTemplateAuthor =
        currentUser?.selfID.did.id === proposalStack?.template.author

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
                        {isProposalAuthor && proposalStreamDoc && (
                            <Box gap="medium">
                                <PlainSectionDivider />
                                <Link
                                    href={`${
                                        window.location.origin
                                    }/dashboard/proposals/edit/${proposalStreamDoc.id.toString()}`}
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
