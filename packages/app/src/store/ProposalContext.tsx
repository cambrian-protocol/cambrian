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
import _ from 'lodash'
import { cpLogger } from '../services/api/Logger.api'
import { ethers } from 'ethers'
import { useCurrentUser } from '../hooks/useCurrentUser'

export type ProposalContextType = {
    proposalStack?: ProposalStackType
    proposalStreamID: string
    proposalContract?: ethers.Contract
    proposalStatus: ProposalStatus
    updateProposal: () => Promise<void>
    isLoaded: boolean
}

type ProposalProviderProps = {
    proposalStreamID: string
}

export const ProposalContext = React.createContext<ProposalContextType>({
    proposalStreamID: '',
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

        useEffect(() => {
            if (currentUser) {
                const _ceramicStagehand = new CeramicStagehand(
                    currentUser.selfID
                )
                setCeramicStagehand(_ceramicStagehand)
            }
        }, [currentUser])

        useEffect(() => {
            if (ceramicStagehand) initProposal()
        }, [ceramicStagehand])

        const initProposal = async () => {
            if (currentUser && ceramicStagehand) {
                try {
                    const _proposalStreamDoc =
                        (await ceramicStagehand.loadStream(
                            proposalStreamID
                        )) as TileDocument<CeramicProposalModel>

                    const onChainProposal = await getOnChainProposal(
                        currentUser,
                        _proposalStreamDoc,
                        ceramicStagehand
                    )

                    const _proposalStackClones =
                        await ceramicStagehand.loadAndCloneProposalStack(
                            _proposalStreamDoc
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
                        const _templateStreamDoc =
                            (await ceramicStagehand.loadStream(
                                _proposalStreamDoc.content.template.streamID
                            )) as TileDocument<CeramicTemplateModel>

                        const _latestProposalSubmission =
                            getLatestProposalSubmission(
                                proposalStreamID,
                                _templateStreamDoc.content.receivedProposals
                            )

                        // Register new submitted proposal if user is template author
                        if (
                            _proposalStreamDoc.content.isSubmitted &&
                            _latestProposalSubmission?.proposalCommitID !==
                                _proposalStreamDoc.commitId.toString() &&
                            _templateStreamDoc.content.author ===
                                currentUser.selfID.did.id
                        ) {
                            await ceramicStagehand.registerNewProposalSubmission(
                                _proposalStreamDoc,
                                _templateStreamDoc
                            )
                        }

                        setProposalStatus(
                            getProposalStatus(
                                _proposalStreamDoc,
                                _templateStreamDoc
                            )
                        )

                        if (_proposalStackClones.proposal.isSubmitted) {
                            setProposalStack(_proposalStackClones)
                        } else {
                            if (_latestProposalSubmission) {
                                const _latesProposalSubmissionDoc =
                                    (await ceramicStagehand.loadStream(
                                        _latestProposalSubmission.proposalCommitID
                                    )) as TileDocument<CeramicProposalModel>

                                // Initialize the latest submission/commit as proposal stack
                                setProposalStack(
                                    await ceramicStagehand.loadAndCloneProposalStack(
                                        _latesProposalSubmissionDoc
                                    )
                                )

                                // Reload streams - Note: loading the commits has overwritten the streamDocs
                                const _p = (await ceramicStagehand.loadStream(
                                    proposalStreamID
                                )) as TileDocument<CeramicProposalModel>
                                await ceramicStagehand.loadStream(
                                    _p.content.template.streamID
                                )
                            }
                            // Note: If there are no latest submissions and the proposal has not been submitted, no stack will be set
                        }
                    }

                    setIsLoaded(true)
                } catch (e) {
                    cpLogger.push(e)
                }
            }
        }

        return (
            <ProposalContext.Provider
                value={{
                    proposalStreamID: proposalStreamID,
                    proposalStack: proposalStack,
                    proposalStatus: proposalStatus,
                    proposalContract: onChainProposal,
                    updateProposal: initProposal,
                    isLoaded: isLoaded,
                }}
            >
                {children}
            </ProposalContext.Provider>
        )
    }
