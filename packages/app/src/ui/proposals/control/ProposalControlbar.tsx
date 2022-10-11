import FundProposalForm from '../forms/FundProposalForm'
import ProposalExecutedControl from '@cambrian/app/ui/proposals/control/ProposalExecutedControl'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useProposalContext } from '@cambrian/app/hooks/useProposalContext'

// TODO Create ProposalFundingActionbar
const ProposalControlbar = () => {
    const { currentUser } = useCurrentUserContext()
    const { proposalStatus, proposalContract } = useProposalContext()

    const renderControls = () => {
        switch (proposalStatus) {
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
