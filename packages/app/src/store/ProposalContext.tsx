import React, { useEffect, useState } from 'react'
import {
    getLatestProposalSubmission,
    initProposalStatus,
} from '../utils/helpers/proposalHelper'

import { CeramicProposalModel } from '../models/ProposalModel'
import CeramicStagehand from '../classes/CeramicStagehand'
import { CeramicTemplateModel } from '../models/TemplateModel'
import { CompositionModel } from '../models/CompositionModel'
import { ProposalStatus } from '../models/ProposalStatus'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { ethers } from 'ethers'
import { useCurrentUser } from '../hooks/useCurrentUser'

export type ProposalContextType = {
    proposalStack?: ProposalStackType
    proposalContract?: ethers.Contract
    proposalStatus: ProposalStatus
    updateProposal: () => Promise<void>
}

type ProposalProviderProps = {
    proposalStreamID: string
}

export const ProposalContext = React.createContext<ProposalContextType>({
    proposalStatus: ProposalStatus.Unknown,
    updateProposal: async () => {},
})

export type ProposalStackType = {
    proposalDoc: TileDocument<CeramicProposalModel>
    templateDoc: TileDocument<CeramicTemplateModel>
    compositionDoc: TileDocument<CompositionModel>
}

export const ProposalContextProvider: React.FunctionComponent<ProposalProviderProps> =
    ({ proposalStreamID, children }) => {
        const { currentUser } = useCurrentUser()
        const [proposalStack, setProposalStack] = useState<ProposalStackType>()
        const [proposalStatus, setProposalStatus] = useState<ProposalStatus>(
            ProposalStatus.Unknown
        )

        useEffect(() => {
            initProposal()
        }, [currentUser])

        const initProposal = async () => {
            if (currentUser) {
                try {
                    const cs = new CeramicStagehand(currentUser.selfID)

                    const _proposalStack = await cs.loadProposalStack(
                        proposalStreamID
                    )

                    const _latestProposalSubmit = getLatestProposalSubmission(
                        _proposalStack.proposalDoc,
                        _proposalStack.templateDoc
                    )

                    // Init stack
                    if (
                        !_proposalStack.proposalDoc.content.isSubmitted &&
                        currentUser.selfID.did.id !==
                            _proposalStack.proposalDoc.content.author
                    ) {
                        if (_latestProposalSubmit) {
                            // A previous submit is existent, we fetch and init that one.
                            setProposalStack(
                                await cs.loadProposalStack(
                                    _latestProposalSubmit.proposalCommitID
                                )
                            )
                        }
                        // Note: If there are no latest submissions, no stack will be set
                    } else {
                        setProposalStack(_proposalStack)
                    }

                    // Register new submitted proposal
                    if (
                        _proposalStack.proposalDoc.content.isSubmitted &&
                        _latestProposalSubmit?.proposalCommitID !==
                            _proposalStack.proposalDoc.commitId.toString() &&
                        currentUser.selfID.did.id ===
                            _proposalStack.templateDoc.content.author
                    ) {
                        await cs.registerNewProposalSubmission(
                            _proposalStack.proposalDoc,
                            _proposalStack.templateDoc
                        )
                    }

                    // Init Proposal Status
                    setProposalStatus(
                        initProposalStatus(
                            _proposalStack.templateDoc,
                            _proposalStack.proposalDoc
                        )
                    )
                } catch {}
            }
        }

        return (
            <ProposalContext.Provider
                value={{
                    proposalStack: proposalStack,
                    proposalStatus: proposalStatus,
                    updateProposal: initProposal,
                }}
            >
                {children}
            </ProposalContext.Provider>
        )
    }
