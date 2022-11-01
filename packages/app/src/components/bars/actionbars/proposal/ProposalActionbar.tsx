import ProposalReviewActionbar, { PriceModel } from './ProposalReviewActionbar'

import ProposalApprovedActionbar from './ProposalApprovedActionbar'
import ProposalEditActionbar from './ProposalEditActionbar'
import ProposalExecutedActionbar from './ProposalExecutedActionbar'
import ProposalFundingActionbar from './ProposalFundingActionbar'
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

    const renderControls = () => {
        switch (proposalStatus) {
            case ProposalStatus.OnReview:
                return (
                    <>
                        {currentUser && stageStack && (
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
                        {currentUser && stageStack && (
                            <ProposalEditActionbar
                                stageStack={stageStack}
                                currentUser={currentUser}
                                messenger={messenger}
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
            case ProposalStatus.Funding:
                return (
                    <>
                        {currentUser && proposalContract && (
                            <ProposalFundingActionbar
                                messenger={messenger}
                                currentUser={currentUser}
                                proposalContract={proposalContract}
                            />
                        )}
                    </>
                )
            case ProposalStatus.Executed:
                return (
                    <>
                        {currentUser && proposalContract && (
                            <ProposalExecutedActionbar
                                messenger={messenger}
                                currentUser={currentUser}
                                proposalContract={proposalContract}
                            />
                        )}
                    </>
                )
            default:
                return <></>
        }
    }

    return <>{renderControls()}</>
}

export default ProposalActionbar
