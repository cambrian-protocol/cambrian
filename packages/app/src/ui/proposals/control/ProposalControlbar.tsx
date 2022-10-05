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
import { useState } from 'react'

const ProposalControlbar = () => {
    const { currentUser } = useCurrentUserContext()
    const { stageStack, proposalStatus, proposalContract } =
        useProposalContext()
    const [isApproving, setIsApproving] = useState(false) // state lift to pass into funding control

    const isProposalAuthor = currentUser?.did === stageStack?.proposal.author
    const isTemplateAuthor = currentUser?.did === stageStack?.template.author

    const renderControls = () => {
        switch (proposalStatus) {
            case ProposalStatus.OnReview:
                return (
                    <>
                        {isTemplateAuthor && currentUser && (
                            <ProposalReviewControl
                                currentUser={currentUser}
                                setIsApproving={setIsApproving}
                                isApproving={isApproving}
                            />
                        )}
                    </>
                )
            case ProposalStatus.ChangeRequested:
                return (
                    <>
                        {isProposalAuthor && stageStack && (
                            <Box gap="medium">
                                <PlainSectionDivider />
                                <Link
                                    href={`${window.location.origin}/proposal/edit/${stageStack.proposalStreamID}`}
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
                return (
                    <>
                        {currentUser && (
                            <ProposalStartFundingControl
                                currentUser={currentUser}
                                setIsApproving={setIsApproving}
                                isApproving={isApproving}
                            />
                        )}
                    </>
                )
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
