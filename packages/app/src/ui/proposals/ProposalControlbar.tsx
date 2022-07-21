import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import { Button } from 'grommet'
import FundProposalForm from './forms/FundProposalForm'
import Link from 'next/link'
import { PencilCircle } from 'phosphor-react'
import ProposalExecutedControl from '@cambrian/app/components/bars/sidebar/proposal/ProposalExecutedControl'
import ProposalReviewControl from '@cambrian/app/components/bars/sidebar/proposal/ProposalReviewControl'
import ProposalStartFundingControl from '@cambrian/app/components/bars/sidebar/proposal/ProposalStartFundingControl'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useProposal } from '@cambrian/app/hooks/useProposal'

const ProposalControlbar = () => {
    const { currentUser } = useCurrentUser()
    const {
        proposalStack,
        proposalStatus,
        proposalStreamDoc,
        proposalContract,
    } = useProposal()

    const isProposalAuthor =
        currentUser?.selfID.did.id === proposalStack?.proposal.author
    const isTemplateAuthor =
        currentUser?.selfID.did.id === proposalStack?.template.author

    const renderControls = () => {
        switch (proposalStatus) {
            case ProposalStatus.OnReview:
                return <>{isTemplateAuthor && <ProposalReviewControl />}</>
            case ProposalStatus.ChangeRequested:
                return (
                    <>
                        {isProposalAuthor && proposalStreamDoc && (
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
                        )}
                    </>
                )
            case ProposalStatus.Approved:
                return <ProposalStartFundingControl />
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
                return <ProposalExecutedControl />
            default:
                return <></>
        }
    }

    return <>{renderControls()}</>
}

export default ProposalControlbar
