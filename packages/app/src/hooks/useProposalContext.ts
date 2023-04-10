import { ProposalContext, ProposalContextType } from '../store/proposal.context'

import { useContext } from 'react'

export const useProposalContext = () => {
    return useContext<ProposalContextType>(ProposalContext)
}
