import React, { PropsWithChildren, useEffect, useState } from 'react'

import API from '../services/api/cambrian.api'
import Proposal from '../classes/stages/Proposal'
import { ProposalModel } from '../models/ProposalModel'
import ProposalService from '../services/stages/ProposalService'
import { TemplateModel } from '../models/TemplateModel'
import TemplateService from '../services/stages/TemplateService'
import _ from 'lodash'
import { useCurrentUserContext } from '../hooks/useCurrentUserContext'

export type ProposalContextTypeV2 = {
    proposal?: Proposal
    isLoaded: boolean
}

type ProposalProviderPropsV2 = PropsWithChildren<{}> & {
    proposalStreamID: string
}

export const ProposalContextV2 = React.createContext<ProposalContextTypeV2>({
    isLoaded: false,
})

export const ProposalContextProviderV2: React.FunctionComponent<ProposalProviderPropsV2> =
    ({ proposalStreamID, children }) => {
        const { currentUser, isUserLoaded } = useCurrentUserContext()
        const [isLoaded, setIsLoaded] = useState(false)
        const [proposal, setProposal] = useState<Proposal>()

        useEffect(() => {
            if (isUserLoaded) init()
        }, [proposalStreamID, currentUser])

        const init = async () => {
            const proposalService = new ProposalService()
            const templateService = new TemplateService()

            const proposalStreamDoc = await API.doc.readStream<ProposalModel>(
                proposalStreamID
            )

            if (proposalStreamDoc) {
                const templateStreamDoc =
                    await API.doc.readStream<TemplateModel>(
                        proposalStreamDoc.content.template.streamID
                    )

                if (templateStreamDoc) {
                    const _proposal = new Proposal(
                        templateStreamDoc,
                        proposalStreamDoc,
                        proposalService,
                        templateService,
                        currentUser
                    )

                    setProposal(_proposal)
                    setIsLoaded(true)
                }
            }
        }

        return (
            <ProposalContextV2.Provider
                value={{
                    proposal: proposal,
                    isLoaded: isLoaded,
                }}
            >
                {children}
            </ProposalContextV2.Provider>
        )
    }
