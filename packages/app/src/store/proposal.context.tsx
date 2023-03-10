import API, { DocumentModel } from '../services/api/cambrian.api'
import Proposal, { ProposalConfig } from '../classes/stages/Proposal'
import React, { PropsWithChildren, useEffect, useState } from 'react'

import { CompositionModel } from '../models/CompositionModel'
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

                const latestProposalCommitDoc =
                    await getLatestProposalCommitDoc(
                        templateStreamDoc,
                        proposalDoc.streamID
                    )

                const templateCommitDoc =
                    await API.doc.readStream<TemplateModel>(
                        proposalDoc.content.template.commitID
                    )
                if (!templateCommitDoc)
                    throw new Error(
                        'Read Commit Error: Failed to load Template'
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

                const proposalConfig: ProposalConfig = {
                    compositionDoc: compositionDoc,
                    proposalDocs: {
                        streamDoc: proposalDoc,
                        latestCommitDoc: latestProposalCommitDoc,
                    },
                    templateDocs: {
                        streamDoc: templateStreamDoc,
                        commitDoc: templateCommitDoc,
                    },
                    tokens: {
                        denomination: denominationToken,
                        collateral: collateralToken,
                    },
                }

                const _proposal = new Proposal(
                    proposalConfig,
                    new ProposalService(),
                    new TemplateService(),
                    currentUser
                )

                setProposal(_proposal)
                setIsLoaded(true)
            } catch (e) {
                console.error(e)
            }
        }

        const getLatestProposalCommitDoc = async (
            templateStreamDoc: DocumentModel<TemplateModel>,
            proposalStreamID: string
        ): Promise<DocumentModel<ProposalModel> | undefined> => {
            const allProposalCommits =
                templateStreamDoc.content.receivedProposals[proposalStreamID]
            if (allProposalCommits && allProposalCommits.length > 0) {
                const latestProposalCommit = allProposalCommits.slice(-1)[0]
                return await API.doc.readCommit<ProposalModel>(
                    proposalStreamID,
                    latestProposalCommit.proposalCommitID
                )
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
            const denominationToken =
                denominationTokenAddress === collateralTokenAddress
                    ? collateralToken
                    : await TokenAPI.getTokenInfo(
                          denominationTokenAddress,
                          currentUser?.web3Provider,
                          currentUser?.chainId
                      )

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
