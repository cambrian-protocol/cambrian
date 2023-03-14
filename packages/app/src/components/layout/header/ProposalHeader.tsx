import BaseHeader from './BaseHeader'
import Proposal from '@cambrian/app/classes/stages/Proposal'
import ProposalStatusBadge from '../../badges/ProposalStatusBadge'
import SolverConfigInfoButton from '../../buttons/SolverConfigInfoButton'
import TemplateInfoButton from '../../buttons/TemplateInfoButton'
import { mergeFlexIntoComposition } from '@cambrian/app/utils/helpers/flexInputHelpers'
import useCambrianProfile from '@cambrian/app/hooks/useCambrianProfile'

interface ProposalHeaderProps {
    proposal: Proposal
}

const ProposalHeader = ({ proposal }: ProposalHeaderProps) => {
    const [proposalAuthor] = useCambrianProfile(proposal.content.author)

    return (
        <BaseHeader
            title={proposal.content.title}
            metaTitle="Proposal"
            statusBadge={<ProposalStatusBadge status={proposal.status} />}
            authorProfileDoc={proposalAuthor}
            items={[
                <TemplateInfoButton
                    denominationToken={proposal.denomintaionToken}
                    templateDoc={proposal.templateCommitDoc}
                />,
                <SolverConfigInfoButton
                    composition={mergeFlexIntoComposition(
                        mergeFlexIntoComposition(
                            proposal.compositionDoc.content,
                            proposal.templateCommitDoc.content.flexInputs
                        ),
                        proposal.content.flexInputs
                    )}
                    price={{
                        amount: proposal.content.price.amount,
                        token: proposal.collateralToken,
                    }}
                />,
            ]}
        />
    )
}

export default ProposalHeader
