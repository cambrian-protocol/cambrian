import { ProposalsHubContext } from './../store/ProposalsHubContext'
import { ProposalsHubContextType } from '../store/ProposalsHubContext'
import { useContext } from 'react'

export const useProposalsHub = () => {
    return useContext<ProposalsHubContextType>(ProposalsHubContext)
}
