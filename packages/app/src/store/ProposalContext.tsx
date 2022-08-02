import React, { useEffect, useState } from 'react'
import {
    getLatestProposalSubmission,
    getOnChainProposal,
    getOnChainProposalId,
    getProposalStatus,
} from '../utils/helpers/proposalHelper'

import { CeramicProposalModel } from '../models/ProposalModel'
import CeramicStagehand from '../classes/CeramicStagehand'
import { CeramicTemplateModel } from '../models/TemplateModel'
import { CompositionModel } from '../models/CompositionModel'
import { ProposalStatus } from '../models/ProposalStatus'
import ProposalsHub from '../hubs/ProposalsHub'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from './UserContext'
import _ from 'lodash'
import { cpLogger } from '../services/api/Logger.api'
import { ethers } from 'ethers'

export type ProposalContextType = {
    proposalStack?: ProposalStackType
    proposalStreamDoc?: TileDocument<CeramicProposalModel>
    templateStreamDoc?: TileDocument<CeramicTemplateModel>
    proposalContract?: ethers.Contract
    proposalStatus: ProposalStatus
    updateProposal: () => Promise<void>
    isLoaded: boolean
}

type ProposalProviderProps = {
    proposalStreamID: string
    currentUser: UserType
}

export const ProposalContext = React.createContext<ProposalContextType>({
    proposalStatus: ProposalStatus.Unknown,
    updateProposal: async () => {},
    isLoaded: false,
})

export type ProposalStackType = {
    proposal: CeramicProposalModel
    template: CeramicTemplateModel
    composition: CompositionModel
}

export const ProposalContextProvider: React.FunctionComponent<ProposalProviderProps> =
    ({ proposalStreamID, currentUser, children }) => {
        const proposalsHub = new ProposalsHub(
            currentUser.signer,
            currentUser.chainId
        )
        const ceramicStagehand = new CeramicStagehand(currentUser.selfID)

        const [proposalStatus, setProposalStatus] = useState<ProposalStatus>(
            ProposalStatus.Unknown
        )
        // Clones of the commit contents
        const [proposalStack, setProposalStack] = useState<ProposalStackType>()
        const [onChainProposal, setOnChainProposal] =
            useState<ethers.Contract>()
        const [isLoaded, setIsLoaded] = useState(false)

        const [proposalStreamDoc, setProposalStreamDoc] =
            useState<TileDocument<CeramicProposalModel>>()
        const [templateStreamDoc, setTemplateStreamDoc] =
            useState<TileDocument<CeramicTemplateModel>>()

        useEffect(() => {
            init()
        }, [])

        // Init offchain Listeners
        useEffect(() => {
            if (
                proposalStatus === ProposalStatus.OnReview ||
                proposalStatus === ProposalStatus.ChangeRequested
            ) {
                if (proposalStreamDoc && templateStreamDoc) {
                    const proposalSub = proposalStreamDoc.subscribe(
                        async (x) => {
                            await refreshProposal()
                        }
                    )
                    const templateSub = templateStreamDoc.subscribe(
                        async (x) => {
                            setProposalStatus(
                                await getProposalStatus(
                                    proposalStreamDoc,
                                    templateStreamDoc,
                                    currentUser,
                                    ceramicStagehand
                                )
                            )
                        }
                    )
                    return () => {
                        proposalSub.unsubscribe()
                        templateSub.unsubscribe()
                    }
                }
            }
        }, [proposalStreamDoc, templateStreamDoc, proposalStatus])

        // Init Proposalshub listener
        useEffect(() => {
            if (proposalStreamDoc) {
                initProposalsHubListener(proposalsHub, proposalStreamDoc)
                return () => {
                    proposalsHub.contract.removeAllListeners()
                }
            }
        }, [proposalStatus, proposalStreamDoc])

        const initProposalsHubListener = async (
            proposalsHub: ProposalsHub,
            proposalStreamDoc: TileDocument<CeramicProposalModel>
        ) => {
            const proposalID = getOnChainProposalId(
                proposalStreamDoc.commitId.toString(),
                proposalStreamDoc.content.template.commitID
            )
            if (proposalStatus === ProposalStatus.Approved) {
                proposalsHub.contract.on(
                    proposalsHub.contract.filters.CreateProposal(proposalID),
                    async () => {
                        console.log('Proposal created!')
                        setProposalStatus(ProposalStatus.Funding)
                        setOnChainProposal(
                            await proposalsHub.getProposal(proposalID)
                        )
                    }
                )
            } else if (proposalStatus === ProposalStatus.Funding) {
                proposalsHub.contract.on(
                    proposalsHub.contract.filters.ExecuteProposal(proposalID),
                    async () => {
                        console.log('Proposal executed!')
                        setProposalStatus(ProposalStatus.Executed)
                    }
                )
            }
        }

        const init = async () => {
            try {
                const _proposalStreamDoc =
                    (await ceramicStagehand.loadTileDocument(
                        proposalStreamID
                    )) as TileDocument<CeramicProposalModel>

                _proposalStreamDoc.makeReadOnly()

                const _templateStreamDoc =
                    (await ceramicStagehand.loadTileDocument(
                        _proposalStreamDoc.content.template.streamID
                    )) as TileDocument<CeramicTemplateModel>

                await initProposal(_proposalStreamDoc, _templateStreamDoc)

                setProposalStreamDoc(_proposalStreamDoc)
                setTemplateStreamDoc(_templateStreamDoc)
                setIsLoaded(true)
            } catch (e) {
                cpLogger.push(e)
            }
        }

        const initProposal = async (
            proposalStreamDoc: TileDocument<CeramicProposalModel>,
            templateStreamDoc: TileDocument<CeramicTemplateModel>
        ) => {
            const onChainProposal = await getOnChainProposal(
                currentUser,
                proposalStreamDoc,
                ceramicStagehand
            )

            const _proposalStackClones =
                await ceramicStagehand.loadProposalStackFromProposal(
                    proposalStreamDoc.content
                )

            if (onChainProposal !== undefined) {
                setOnChainProposal(onChainProposal)
                setProposalStack(_proposalStackClones)
                if (onChainProposal.isExecuted) {
                    setProposalStatus(ProposalStatus.Executed)
                } else {
                    setProposalStatus(ProposalStatus.Funding)
                }
            } else {
                const _latestProposalSubmission = getLatestProposalSubmission(
                    proposalStreamID,
                    templateStreamDoc.content.receivedProposals
                )

                // Register new submitted proposal if user is template author
                if (
                    proposalStreamDoc.content.isSubmitted &&
                    _latestProposalSubmission?.proposalCommitID !==
                        proposalStreamDoc.commitId.toString() &&
                    templateStreamDoc.content.author ===
                        currentUser.selfID.did.id
                ) {
                    await ceramicStagehand.registerNewProposalSubmission(
                        proposalStreamDoc,
                        templateStreamDoc
                    )
                }

                setProposalStatus(
                    await getProposalStatus(
                        proposalStreamDoc,
                        templateStreamDoc,
                        currentUser,
                        ceramicStagehand
                    )
                )
                if (_proposalStackClones.proposal.isSubmitted) {
                    setProposalStack(_proposalStackClones)
                } else {
                    if (_latestProposalSubmission) {
                        // Initialize the latest submission/commit as proposal stack
                        const latestProposalCommitContent =
                            (await ceramicStagehand.loadStreamContent(
                                _latestProposalSubmission.proposalCommitID
                            )) as CeramicProposalModel

                        setProposalStack({
                            ..._proposalStackClones,
                            proposal: latestProposalCommitContent,
                        })
                    }
                    // Note: If there are no latest submissions and the proposal has not been submitted, no stack will be set
                }
            }
        }

        const refreshProposal = async () => {
            if (proposalStreamDoc && templateStreamDoc) {
                await initProposal(proposalStreamDoc, templateStreamDoc)
            }
        }

        return (
            <ProposalContext.Provider
                value={{
                    proposalStreamDoc: proposalStreamDoc,
                    templateStreamDoc: templateStreamDoc,
                    proposalStack: proposalStack,
                    proposalStatus: proposalStatus,
                    proposalContract: onChainProposal,
                    updateProposal: refreshProposal,
                    isLoaded: isLoaded,
                }}
            >
                {children}
            </ProposalContext.Provider>
        )
    }
