import CeramicStagehand, { StageNames } from '../classes/CeramicStagehand'
import React, { SetStateAction, useEffect, useState } from 'react'
import {
    getLatestProposalSubmission,
    getProposalStatus,
} from '../utils/helpers/proposalHelper'

import { CeramicProposalModel } from '../models/ProposalModel'
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
    proposalContract?: ethers.Contract
    proposalStatus: ProposalStatus
    updateProposal: () => Promise<void>
    proposalInput?: CeramicProposalModel
    setProposalInput: React.Dispatch<
        SetStateAction<CeramicProposalModel | undefined>
    >
    onSaveProposal: () => Promise<void>
    onResetProposalInput: () => void
    isLoaded: boolean
}

type ProposalProviderProps = {
    proposalStreamID: string
}

export const ProposalContext = React.createContext<ProposalContextType>({
    proposalStatus: ProposalStatus.Unknown,
    updateProposal: async () => {},
    onSaveProposal: async () => {},
    onResetProposalInput: () => {},
    setProposalInput: () => {},
    isLoaded: false,
})

export type ProposalStackType = {
    proposalDoc: TileDocument<CeramicProposalModel>
    templateDoc: TileDocument<CeramicTemplateModel>
    compositionDoc: TileDocument<CompositionModel>
}

export const ProposalContextProvider: React.FunctionComponent<ProposalProviderProps> =
    ({ proposalStreamID, children }) => {
        const { currentUser } = useCurrentUser()
        const [ceramicStagehand, setCeramicStagehand] =
            useState<CeramicStagehand>()
        const [proposalStack, setProposalStack] = useState<ProposalStackType>()
        const [proposalStatus, setProposalStatus] = useState<ProposalStatus>(
            ProposalStatus.Unknown
        )
        const [isLoaded, setIsLoaded] = useState(false)

        // Used for editing the proposal
        const [proposalInput, setProposalInput] =
            useState<CeramicProposalModel>()

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
                    const _proposalStack =
                        await ceramicStagehand.loadProposalStack(
                            proposalStreamID
                        )

                    const _templateStreamDoc =
                        (await ceramicStagehand.loadStream(
                            _proposalStack.proposalDoc.content.template.streamID
                        )) as TileDocument<CeramicTemplateModel>

                    const _latestProposalSubmit = getLatestProposalSubmission(
                        _proposalStack.proposalDoc,
                        _templateStreamDoc
                    )

                    let _proposalStatus: ProposalStatus = ProposalStatus.Unknown
                    // Init stack - Just the proposal author is allowed to see his unsubmitted proposals
                    if (
                        !_proposalStack.proposalDoc.content.isSubmitted &&
                        currentUser.selfID.did.id !==
                            _proposalStack.proposalDoc.content.author
                    ) {
                        if (_latestProposalSubmit) {
                            // A previous submit is existent, we fetch and init that one.
                            _proposalStatus = ProposalStatus.ChangeRequested
                            setProposalStatus(_proposalStatus)
                            setProposalStack(
                                _.cloneDeep(
                                    await ceramicStagehand.loadProposalStack(
                                        _latestProposalSubmit.proposalCommitID
                                    )
                                )
                            )
                        }
                        // Note: If there are no latest submissions, no stack will be set
                    } else {
                        setProposalStack(_proposalStack)
                        _proposalStatus = getProposalStatus(
                            _proposalStack.proposalDoc,
                            _templateStreamDoc
                        )
                        setProposalStatus(_proposalStatus)
                    }

                    // Register new submitted proposal if user is template author
                    if (
                        _proposalStack.proposalDoc.content.isSubmitted &&
                        _latestProposalSubmit?.proposalCommitID !==
                            _proposalStack.proposalDoc.commitId.toString() &&
                        currentUser.selfID.did.id ===
                            _proposalStack.templateDoc.content.author
                    ) {
                        await ceramicStagehand.registerNewProposalSubmission(
                            _proposalStack.proposalDoc
                        )
                    }

                    // Init Input if editable
                    if (
                        (_proposalStatus === ProposalStatus.Draft ||
                            _proposalStatus ===
                                ProposalStatus.ChangeRequested) &&
                        currentUser?.selfID.did.id ===
                            _proposalStack?.proposalDoc.content.author &&
                        _proposalStack
                    ) {
                        setProposalInput(
                            _.cloneDeep(_proposalStack.proposalDoc.content)
                        )
                    }

                    setIsLoaded(true)
                } catch (e) {
                    cpLogger.push(e)
                }
            }
        }

        const saveProposal = async () => {
            if (proposalInput && ceramicStagehand && proposalStack) {
                if (
                    !_.isEqual(proposalInput, proposalStack.proposalDoc.content)
                ) {
                    const { uniqueTag } = await ceramicStagehand.updateStage(
                        proposalStreamID as string,
                        { ...proposalInput, isSubmitted: false },
                        StageNames.proposal
                    )
                    const proposalWithUniqueTitle = {
                        ...proposalInput,
                        title: uniqueTag,
                        isSubmitted: false,
                    }

                    setProposalInput(proposalWithUniqueTitle)
                    initProposal()
                }
            }
        }

        const resetProposalInput = () => {
            if (proposalStack) {
                setProposalInput(_.cloneDeep(proposalStack.proposalDoc.content))
            }
        }

        return (
            <ProposalContext.Provider
                value={{
                    proposalStack: proposalStack,
                    proposalStatus: proposalStatus,
                    updateProposal: initProposal,
                    proposalInput: proposalInput,
                    setProposalInput: setProposalInput,
                    onResetProposalInput: resetProposalInput,
                    onSaveProposal: saveProposal,
                    isLoaded: isLoaded,
                }}
            >
                {children}
            </ProposalContext.Provider>
        )
    }
