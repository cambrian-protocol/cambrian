import {
    ProposalContext,
    ProposalContextType,
} from './../store/ProposalContext'

import { useContext } from 'react'

export const useProposal = () => {
    return useContext<ProposalContextType>(ProposalContext)
}
