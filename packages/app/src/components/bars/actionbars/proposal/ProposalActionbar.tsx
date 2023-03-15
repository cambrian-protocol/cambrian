import ProposalApprovedActionbar from './ProposalApprovedActionbar'
import ProposalEditActionbar from './ProposalEditActionbar'
import ProposalExecutedActionbar from './ProposalExecutedActionbar'
import ProposalFundingActionbar from './ProposalFundingActionbar'
import ProposalReviewActionbar from './ProposalReviewActionbar'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import { useProposalContext } from '@cambrian/app/hooks/useProposalContext'
import { useState } from 'react'

const ProposalActionbar = () => {
    const { proposal } = useProposalContext()
    const [isApproving, setIsApproving] = useState(false) // state lift to pass into approveActionbar

    const renderControls = () => {
        switch (proposal?.status) {
            case ProposalStatus.OnReview:
                return (
                    <ProposalReviewActionbar
                        proposal={proposal}
                        setIsApproving={setIsApproving}
                        isApproving={isApproving}
                    />
                )
            case ProposalStatus.ChangeRequested:
                return <ProposalEditActionbar proposal={proposal} />
                /*  case ProposalStatus.Approved:
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
            default: */
                return <></>
        }
    }

    return <>{renderControls()}</>
}

export default ProposalActionbar
