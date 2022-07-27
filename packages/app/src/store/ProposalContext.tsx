import React, { useEffect, useState } from 'react'
import {
    getLatestProposalSubmission,
    getOnChainProposal,
    getProposalStatus,
} from '../utils/helpers/proposalHelper'

import { CeramicProposalModel } from '../models/ProposalModel'
import CeramicStagehand from '../classes/CeramicStagehand'
import { CeramicTemplateModel } from '../models/TemplateModel'
import { CompositionModel } from '../models/CompositionModel'
import { ProposalStatus } from '../models/ProposalStatus'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from './UserContext'
import _ from 'lodash'
import { cpLogger } from '../services/api/Logger.api'
import { ethers } from 'ethers'
import { useCurrentUser } from '../hooks/useCurrentUser'

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
    ({ proposalStreamID, children }) => {
        const { currentUser } = useCurrentUser()
        const [ceramicStagehand, setCeramicStagehand] =
            useState<CeramicStagehand>()
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
            currentUser && init(currentUser)
        }, [currentUser])

        // Init Listeners
        useEffect(() => {
            if (proposalStreamDoc && templateStreamDoc) {
                const proposalSub = proposalStreamDoc.subscribe((x) => {
                    refreshProposal()
                })
                const templateSub = templateStreamDoc.subscribe((x) => {
                    setProposalStatus(
                        getProposalStatus(proposalStreamDoc, templateStreamDoc)
                    )
                })
                return () => {
                    proposalSub.unsubscribe()
                    templateSub.unsubscribe()
                }
            }
        }, [proposalStreamDoc, templateStreamDoc])

        const init = async (currentUser: UserType) => {
            try {
                const _ceramicStagehand = new CeramicStagehand(
                    currentUser.selfID
                )
                const _proposalStreamDoc =
                    (await _ceramicStagehand.loadTileDocument(
                        proposalStreamID
                    )) as TileDocument<CeramicProposalModel>

                const _templateStreamDoc =
                    (await _ceramicStagehand.loadTileDocument(
                        _proposalStreamDoc.content.template.streamID
                    )) as TileDocument<CeramicTemplateModel>

                initProposal(
                    currentUser,
                    _ceramicStagehand,
                    _proposalStreamDoc,
                    _templateStreamDoc
                )

                setCeramicStagehand(_ceramicStagehand)
                setProposalStreamDoc(_proposalStreamDoc)
                setTemplateStreamDoc(_templateStreamDoc)
            } catch (e) {
                cpLogger.push(e)
            }
        }

        const initProposal = async (
            currentUser: UserType,
            ceramicStagehand: CeramicStagehand,
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
                    getProposalStatus(proposalStreamDoc, templateStreamDoc)
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
            if (
                currentUser &&
                ceramicStagehand &&
                proposalStreamDoc &&
                templateStreamDoc
            ) {
                initProposal(
                    currentUser,
                    ceramicStagehand,
                    proposalStreamDoc,
                    templateStreamDoc
                )
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
