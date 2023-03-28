import React, { PropsWithChildren, useEffect, useState } from 'react'

import { DocumentModel } from '../services/api/cambrian.api'
import Proposal from '../classes/stages/Proposal'
import { ProposalModel } from '../models/ProposalModel'
import ProposalService from '../services/stages/ProposalService'
import TemplateService from '../services/stages/TemplateService'
import _ from 'lodash'
import { useCurrentUserContext } from '../hooks/useCurrentUserContext'

export type ProposalContextType = {
    proposal?: Proposal
    isLoaded: boolean
}

type ProposalProviderProps = PropsWithChildren<{}> & {
    proposalDoc: DocumentModel<ProposalModel>
}

export const ProposalContext = React.createContext<ProposalContextType>({
    isLoaded: false,
})

export const ProposalContextProvider: React.FunctionComponent<ProposalProviderProps> =
    ({ proposalDoc, children }) => {
        const { currentUser, isUserLoaded } = useCurrentUserContext()
        const [isLoaded, setIsLoaded] = useState(false)
        const [proposal, setProposal] = useState<Proposal>()
        const [, forceRender] = useState({})

        useEffect(() => {
            const initProposal = async () => {
                try {
                    setIsLoaded(false)
                    const proposalService = new ProposalService()
                    const proposalConfig =
                        await proposalService.fetchProposalConfig(
                            proposalDoc,
                            currentUser
                        )
                    if (!proposalConfig)
                        throw new Error('Error while fetching propsal config')

                    const _proposal = new Proposal(
                        proposalConfig,
                        proposalService,
                        new TemplateService(),
                        forceUpdate,
                        currentUser
                    )

                    setProposal(_proposal)
                    setIsLoaded(true)
                } catch (e) {
                    console.error(e)
                }
            }

            if (isUserLoaded) initProposal()
        }, [isUserLoaded, currentUser])

        const forceUpdate = () => {
            forceRender({})
        }

        return (
            <ProposalContext.Provider
                value={{
                    proposal: proposal,
                    isLoaded: isLoaded,
                }}
            >
                {children}
            </ProposalContext.Provider>
        )
    }