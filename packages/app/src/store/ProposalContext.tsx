import React, { useEffect, useState } from 'react'
import {
    getApprovedProposalCommitID,
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
    templateStreamDoc?: TileDocument<CeramicTemplateModel>
    proposalContract?: ethers.Contract
    proposalStatus: ProposalStatus
    isLoaded: boolean
}

type ProposalProviderProps = {
    proposalStreamID: string
    currentUser: UserType
}

export const ProposalContext = React.createContext<ProposalContextType>({
    proposalStatus: ProposalStatus.Unknown,
    isLoaded: false,
})

export type ProposalStackType = {
    proposalDoc: TileDocument<CeramicProposalModel>
    templateDoc: TileDocument<CeramicTemplateModel>
    compositionDoc: TileDocument<CompositionModel>
}

export const ProposalContextProvider: React.FunctionComponent<ProposalProviderProps> =
    ({ proposalStreamID, currentUser, children }) => {
        const proposalsHub = new ProposalsHub(
            currentUser.signer,
            currentUser.chainId
        )
        const ceramicStagehand = new CeramicStagehand(currentUser)

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
                    console.log('controllers: ', proposalStreamDoc.controllers)

                    const proposalSub = proposalStreamDoc.subscribe(
                        async (x) => {
                            await refreshProposal()
                        }
                    )
                    const templateSub = templateStreamDoc.subscribe((x) => {
                        setProposalStatus(
                            getProposalStatus(
                                proposalStreamDoc,
                                templateStreamDoc.content.receivedProposals[
                                    proposalStreamDoc.id.toString()
                                ]
                            )
                        )
                    })
                    return () => {
                        proposalSub.unsubscribe()
                        templateSub.unsubscribe()
                    }
                }
            }
        }, [proposalStreamDoc, templateStreamDoc, proposalStatus])

        // Init Proposalshub listener
        useEffect(() => {
            if (proposalStack) {
                initProposalsHubListener(proposalsHub, proposalStack)
                return () => {
                    proposalsHub.contract.removeAllListeners()
                }
            }
        }, [proposalStatus, proposalStack])

        const initProposalsHubListener = async (
            proposalsHub: ProposalsHub,
            proposalStack: ProposalStackType
        ) => {
            const proposalID = getOnChainProposalId(
                proposalStack.proposalDoc.commitId.toString(),
                proposalStack.proposalDoc.content.template.commitID
            )
            if (proposalStatus === ProposalStatus.Approved) {
                proposalsHub.contract.on(
                    proposalsHub.contract.filters.CreateProposal(proposalID),
                    async () => {
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
            console.log('pdoc: ', proposalStreamDoc)
            console.log('tdoc: ', templateStreamDoc)

            const approvedCommitID = getApprovedProposalCommitID(
                templateStreamDoc.content,
                proposalStreamDoc.id.toString()
            )

            if (
                approvedCommitID &&
                proposalStreamDoc.allCommitIds.find(
                    (commitID) => commitID.toString() === approvedCommitID
                )
            ) {
                const _proposalStack =
                    await ceramicStagehand.loadProposalStackFromID(
                        approvedCommitID
                    )

                const onChainProposal = await getOnChainProposal(
                    currentUser,
                    approvedCommitID,
                    _proposalStack.proposalDoc.content.template.commitID
                )

                setOnChainProposal(onChainProposal)
                setProposalStack(_proposalStack)
                setProposalStatus(
                    getProposalStatus(
                        _proposalStack.proposalDoc,
                        templateStreamDoc.content.receivedProposals[
                            proposalStreamDoc.id.toString()
                        ],
                        onChainProposal
                    )
                )
            } else {
                const _proposalStack =
                    await ceramicStagehand.loadProposalStackFromProposal(
                        proposalStreamDoc
                    )

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
                        currentUser.ceramic.did?.parent
                ) {
                    await ceramicStagehand.registerNewProposalSubmission(
                        proposalStreamDoc,
                        templateStreamDoc
                    )
                }

                setProposalStatus(
                    getProposalStatus(
                        _proposalStack.proposalDoc,
                        templateStreamDoc.content.receivedProposals[
                            proposalStreamDoc.id.toString()
                        ]
                    )
                )

                if (_proposalStack.proposalDoc.content.isSubmitted) {
                    console.log('isSubmitted')
                    setProposalStack(_proposalStack)
                } else {
                    console.log('notSubmitted')

                    if (_latestProposalSubmission) {
                        // Initialize the latest submission/commit as proposal stack
                        const latestProposalCommitContent =
                            (await ceramicStagehand.loadReadOnlyStream(
                                _latestProposalSubmission.proposalCommitID
                            )) as TileDocument<CeramicProposalModel>

                        setProposalStack({
                            ..._proposalStack,
                            proposalDoc: latestProposalCommitContent,
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
                    templateStreamDoc: templateStreamDoc,
                    proposalStack: proposalStack,
                    proposalStatus: proposalStatus,
                    proposalContract: onChainProposal,
                    isLoaded: isLoaded,
                }}
            >
                {children}
            </ProposalContext.Provider>
        )
    }
