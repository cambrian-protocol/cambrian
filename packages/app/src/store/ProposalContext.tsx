import React, { useEffect, useState } from 'react'
import {
    getApprovedProposalCommitID,
    getLatestProposalSubmission,
    getOnChainProposal,
    getOnChainProposalId,
    getProposalStatus,
} from '../utils/helpers/proposalHelper'

import { CAMBRIAN_DID } from 'packages/app/config'
import CeramicProposalAPI from '../services/ceramic/CeramicProposalAPI'
import { CeramicProposalModel } from '../models/ProposalModel'
import CeramicTemplateAPI from '../services/ceramic/CeramicTemplateAPI'
import { CeramicTemplateModel } from '../models/TemplateModel'
import { CompositionModel } from '../models/CompositionModel'
import { ProposalStackType } from '../ui/dashboard/ProposalsDashboardUI'
import { ProposalStatus } from '../models/ProposalStatus'
import ProposalsHub from '../hubs/ProposalsHub'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from './UserContext'
import _ from 'lodash'
import { ceramicInstance } from '../services/ceramic/CeramicUtils'
import { cpLogger } from '../services/api/Logger.api'
import { ethers } from 'ethers'

export type ProposalContextType = {
    proposalStack?: ProposalDocsStackType
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

export type ProposalDocsStackType = {
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
        const ceramicProposalAPI = new CeramicProposalAPI(currentUser)
        const ceramicTemplateAPI = new CeramicTemplateAPI(currentUser)

        const [proposalStatus, setProposalStatus] = useState<ProposalStatus>(
            ProposalStatus.Unknown
        )
        const [proposalStack, setProposalStack] =
            useState<ProposalDocsStackType>()
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

        useEffect(() => {
            updateProposalLib()
        }, [proposalStatus, proposalStack])

        // Init offchain Listeners
        useEffect(() => {
            if (
                proposalStatus === ProposalStatus.OnReview ||
                proposalStatus === ProposalStatus.ChangeRequested
            ) {
                if (proposalStreamDoc && templateStreamDoc) {
                    const proposalSub = proposalStreamDoc.subscribe(
                        async (x) => {
                            console.log('Proposal changed: ', x)
                            await initProposal(
                                proposalStreamDoc,
                                templateStreamDoc
                            )
                        }
                    )
                    const templateSub = templateStreamDoc.subscribe(
                        async (x) => {
                            console.log('Template changed: ', x)
                            await initProposal(
                                proposalStreamDoc,
                                templateStreamDoc
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

        // Init onchain Listeners
        useEffect(() => {
            if (proposalStack) {
                initProposalsHubListener(proposalsHub, proposalStack)
                return () => {
                    proposalsHub.contract.removeAllListeners()
                }
            }
        }, [proposalStatus, proposalStack])

        const updateProposalLib = async () => {
            if (proposalStack && proposalStatus !== ProposalStatus.Unknown) {
                await ceramicProposalAPI.addRecentProposal(proposalStreamID)
                if (
                    proposalStack.templateDoc.content.author ===
                        currentUser.did &&
                    proposalStatus !== ProposalStatus.Canceled
                ) {
                    await ceramicProposalAPI.addReceivedProposal(
                        proposalStreamID
                    )
                }
            }
        }

        const initProposalsHubListener = async (
            proposalsHub: ProposalsHub,
            proposalStack: ProposalDocsStackType
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
                    await ceramicProposalAPI.loadProposalDoc(proposalStreamID)

                _proposalStreamDoc.makeReadOnly()

                const _templateStreamDoc =
                    await ceramicTemplateAPI.loadTemplateDoc(
                        _proposalStreamDoc.content.template.streamID
                    )

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
            try {
                const cambrianProposalStackDoc =
                    (await TileDocument.deterministic(
                        ceramicInstance(currentUser),
                        {
                            controllers: [CAMBRIAN_DID],
                            family: 'cambrian-archive',
                            tags: [proposalStreamID],
                        }
                    )) as TileDocument<{ proposalStack: ProposalStackType }>

                if (cambrianProposalStackDoc.content.proposalStack) {
                    const proposalStack =
                        await ceramicProposalAPI.loadProposalStackFromID(
                            cambrianProposalStackDoc.content.proposalStack
                                .proposalCommitID
                        )
                    const onChainProposal = await getOnChainProposal(
                        currentUser,
                        cambrianProposalStackDoc.content.proposalStack
                            .proposalCommitID,
                        cambrianProposalStackDoc.content.proposalStack.proposal
                            .template.commitID
                    )

                    setProposalStatus(
                        getProposalStatus(
                            proposalStack.proposalDoc.commitId.toString(),
                            proposalStack.proposalDoc.content,
                            cambrianProposalStackDoc.content.proposalStack,
                            onChainProposal
                        )
                    )
                    setOnChainProposal(onChainProposal)
                    setProposalStack(proposalStack)
                } else {
                    // Fallback in case cambrianProposalStack had no entry but there is an approved commit
                    const approvedCommitID = getApprovedProposalCommitID(
                        templateStreamDoc.content,
                        proposalStreamDoc.id.toString()
                    )
                    let onChainProposal: ethers.Contract | undefined
                    if (approvedCommitID) {
                        onChainProposal = await getOnChainProposal(
                            currentUser,
                            approvedCommitID,
                            proposalStreamDoc.content.template.commitID
                        )
                        setOnChainProposal(onChainProposal)
                    }

                    const _proposalStack =
                        await ceramicProposalAPI.loadProposalStackFromID(
                            proposalStreamID
                        )

                    const _latestProposalSubmission =
                        getLatestProposalSubmission(
                            proposalStreamID,
                            templateStreamDoc.content.receivedProposals
                        )

                    // Register new submitted proposal if user is template author
                    if (
                        _proposalStack.proposalDoc.content.isSubmitted &&
                        _latestProposalSubmission?.proposalCommitID !==
                            _proposalStack.proposalDoc.commitId.toString() &&
                        templateStreamDoc.content.author === currentUser.did
                    ) {
                        console.log('Trying to register new Proposal')
                        await ceramicTemplateAPI.registerNewProposalSubmission(
                            proposalStreamID
                        )
                    }

                    setProposalStatus(
                        getProposalStatus(
                            _proposalStack.proposalDoc.commitId.toString(),
                            _proposalStack.proposalDoc.content,
                            undefined,
                            onChainProposal,
                            templateStreamDoc.content.receivedProposals[
                                _proposalStack.proposalDoc.id.toString()
                            ]
                        )
                    )
                    if (proposalStreamDoc.content.isSubmitted) {
                        setProposalStack(_proposalStack)
                    } else {
                        if (_latestProposalSubmission) {
                            // Initialize the latest submission/commit as proposal stack

                            const latestProposalCommitDoc =
                                (await ceramicInstance(currentUser).loadStream(
                                    _latestProposalSubmission.proposalCommitID
                                )) as TileDocument<CeramicProposalModel>
                            setProposalStack({
                                ..._proposalStack,
                                proposalDoc: latestProposalCommitDoc,
                            })
                        }
                        // Note: If there are no latest submissions and the proposal has not been submitted, no stack will be set
                    }
                }
            } catch (e) {
                cpLogger.push(e)
            }
        }

        return (
            <ProposalContext.Provider
                value={{
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
