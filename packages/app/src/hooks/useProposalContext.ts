import { ProposalContext, ProposalContextType } from '../store/ProposalContext'

import { useContext } from 'react'

export const useProposalContext = () => {
    return useContext<ProposalContextType>(ProposalContext)
}
