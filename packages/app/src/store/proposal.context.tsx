import API, { DocumentModel } from '../services/api/cambrian.api'
import React, { PropsWithChildren, useEffect, useState } from 'react'

import { CompositionModel } from '../models/CompositionModel'
import Proposal from '../classes/stages/Proposal'
import { ProposalModel } from '../models/ProposalModel'
import ProposalService from '../services/stages/ProposalService'
import { TemplateModel } from '../models/TemplateModel'
import TemplateService from '../services/stages/TemplateService'
import { TokenAPI } from '../services/api/Token.api'
import { TokenModel } from '../models/TokenModel'
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
                    throw new Error(
                        'Read Stream Error: Failed to load Template'
                    )

                const compositionDoc =
                    await API.doc.readCommit<CompositionModel>(
                        templateStreamDoc.content.composition.streamID,
                        templateStreamDoc.content.composition.commitID
                    )

                if (!compositionDoc)
                    throw new Error(
                        'Read Commit Error: Failed to load Composition'
                    )

                const { collateralToken, denominationToken } =
                    await getProposalTokenInfos(
                        proposalDoc.content.price.tokenAddress,
                        templateStreamDoc.content.price.denominationTokenAddress
                    )

                // TODO I will need the templateCommitDoc too.. otherwise the information of the templateStream will be displayed
                const _proposal = new Proposal(
                    compositionDoc,
                    templateStreamDoc,
                    proposalDoc,
                    new ProposalService(),
                    new TemplateService(),
                    collateralToken,
                    denominationToken,
                    currentUser
                )

                setProposal(_proposal)
                setIsLoaded(true)
            } catch (e) {
                console.error(e)
            }
        }

        const getProposalTokenInfos = async (
            collateralTokenAddress: string,
            denominationTokenAddress: string
        ): Promise<{
            collateralToken: TokenModel
            denominationToken: TokenModel
        }> => {
            const collateralToken = await TokenAPI.getTokenInfo(
                collateralTokenAddress,
                currentUser?.web3Provider,
                currentUser?.chainId
            )

            let denominationToken = collateralToken
            if (denominationTokenAddress !== collateralTokenAddress) {
                denominationToken = await TokenAPI.getTokenInfo(
                    denominationTokenAddress,
                    currentUser?.web3Provider,
                    currentUser?.chainId
                )
            }
            return {
                collateralToken: collateralToken,
                denominationToken: denominationToken,
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
