import ProposalExecutedControl from '@cambrian/app/ui/proposals/control/ProposalExecutedControl'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import { useProposalContext } from '@cambrian/app/hooks/useProposalContext'

// TODO Integrate to ProposalFundingActionbar
const ProposalControlbar = () => {
    const { proposalStatus } = useProposalContext()

    const renderControls = () => {
        switch (proposalStatus) {
            case ProposalStatus.Executed:
                return <ProposalExecutedControl />
            default:
                return <></>
        }
    }

    return <>{renderControls()}</>
}

export default ProposalControlbar
