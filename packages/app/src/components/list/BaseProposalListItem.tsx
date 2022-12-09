import { useEffect, useState } from 'react'

import BaseSolverCard from '../cards/BaseSolverCard'
import { ProposalInfoType } from './ProposalListItem'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import ProposalStatusBadge from '../badges/ProposalStatusBadge'
import { UserType } from '@cambrian/app/store/UserContext'
import { fetchProposalInfo } from '@cambrian/app/utils/helpers/proposalHelper'

interface ProposalCardProps {
    proposal: ProposalModel
    proposalStreamID: string
    currentUser: UserType
}

const ProposalCard = ({
    proposal,
    proposalStreamID,
    currentUser,
}: ProposalCardProps) => {
    const [proposalInfo, setProposalInfo] = useState<ProposalInfoType>()

    useEffect(() => {
        fetchInfo()
    }, [])
    const fetchInfo = async () => {
        setProposalInfo(await fetchProposalInfo(currentUser, proposalStreamID))
    }

    return (
        <BaseSolverCard
            type={'Proposal'}
            title={proposal.title}
            description={proposal.description}
            streamID={proposalStreamID}
            statusBadge={
                <ProposalStatusBadge
                    status={proposalInfo?.status}
                    onChainProposalId={proposalInfo?.onChainProposalId}
                />
            }
        />
    )
}

export default ProposalCard
