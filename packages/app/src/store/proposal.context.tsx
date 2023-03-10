import API, { DocumentModel } from '../services/api/cambrian.api'
import React, { PropsWithChildren, useEffect, useState } from 'react'

import Proposal from '../classes/stages/Proposal'
import { ProposalModel } from '../models/ProposalModel'
import ProposalService from '../services/stages/ProposalService'
import { TemplateModel } from '../models/TemplateModel'
import TemplateService from '../services/stages/TemplateService'
import { TokenAPI } from '../services/api/Token.api'
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

        useEffect(() => {
            if (isUserLoaded) init()
        }, [isUserLoaded])

        const init = async () => {
            try {
                setIsLoaded(false)
                const templateStreamDoc =
                    await API.doc.readStream<TemplateModel>(
                        proposalDoc.content.template.streamID
                    )

                if (!templateStreamDoc)
                    throw new Error('Failed to load Template')

                const collateralToken = await TokenAPI.getTokenInfo(
                    proposalDoc.content.price.tokenAddress,
                    currentUser?.web3Provider,
                    currentUser?.chainId
                )

                const proposalService = new ProposalService()
                const templateService = new TemplateService()

                const _proposal = new Proposal(
                    templateStreamDoc,
                    proposalDoc,
                    collateralToken,
                    proposalService,
                    templateService,
                    currentUser
                )

                setProposal(_proposal)
                setIsLoaded(true)
            } catch (e) {
                console.error(e)
            }
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
