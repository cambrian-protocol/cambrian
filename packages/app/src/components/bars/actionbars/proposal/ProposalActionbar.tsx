import ProposalReviewActionbar, { PriceModel } from './ProposalReviewActionbar'

import ProposalApprovedActionbar from './ProposalApprovedActionbar'
import ProposalEditActionbar from './ProposalEditActionbar'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useProposalContext } from '@cambrian/app/hooks/useProposalContext'
import { useState } from 'react'

interface ProposalActionbarProps {
    messenger?: JSX.Element
    proposedPrice: PriceModel
}

const ProposalActionbar = ({
    messenger,
    proposedPrice,
}: ProposalActionbarProps) => {
    const { currentUser } = useCurrentUserContext()
    const { stageStack, proposalStatus, proposalContract } =
        useProposalContext()
    const [isApproving, setIsApproving] = useState(false) // state lift to pass into approveActionbar

    const isProposalAuthor = currentUser?.did === stageStack?.proposal.author
    const isTemplateAuthor = currentUser?.did === stageStack?.template.author

    const renderControls = () => {
        switch (proposalStatus) {
            case ProposalStatus.OnReview:
                return (
                    <>
                        {isTemplateAuthor && currentUser && stageStack && (
                            <ProposalReviewActionbar
                                proposedPrice={proposedPrice}
                                messenger={messenger}
                                currentUser={currentUser}
                                setIsApproving={setIsApproving}
                                isApproving={isApproving}
                                stageStack={stageStack}
                            />
                        )}
                    </>
                )
            case ProposalStatus.ChangeRequested:
                return (
                    <>
                        {isProposalAuthor && stageStack && (
                            <ProposalEditActionbar
                                messenger={messenger}
                                proposalStreamID={stageStack.proposalStreamID}
                            />
                        )}
                    </>
                )
            case ProposalStatus.Approved:
                return (
                    <>
                        {currentUser && (
                            <ProposalApprovedActionbar
                                messenger={messenger}
                                currentUser={currentUser}
                                setIsApproving={setIsApproving}
                                isApproving={isApproving}
                            />
                        )}
                    </>
                )
            /*TODO Integrate Funding 
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
                return <ProposalExecutedControl /> */
            default:
                return <></>
        }
    }

    return <>{renderControls()}</>
}

export default ProposalActionbar
