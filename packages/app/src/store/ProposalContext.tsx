import CeramicStagehand, { StageNames } from '../classes/CeramicStagehand'
import React, { SetStateAction, useEffect, useState } from 'react'
import {
    getLatestProposalSubmission,
    getOnChainProposal,
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
    proposalStreamDoc?: TileDocument<CeramicProposalModel>
    templateStreamDoc?: TileDocument<CeramicTemplateModel>
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
                            _proposalStreamDoc.commitId.toString()
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
                                _templateStreamDoc
                            )

                        let _proposalStatus: ProposalStatus =
                            ProposalStatus.Unknown

                        if (
                            !_proposalStackClones.proposal.isSubmitted &&
                            currentUser.selfID.did.id !==
                                _proposalStackClones.proposal.author
                        ) {
                            if (_latestProposalSubmission) {
                                _proposalStatus = ProposalStatus.ChangeRequested
                                setProposalStatus(_proposalStatus)
                                setProposalStack(
                                    await ceramicStagehand.loadAndCloneProposalStack(
                                        _latestProposalSubmission.proposalCommitID
                                    )
                                )
                            }
                            // Note: If there are no latest submissions, no stack will be set
                        } else {
                            setProposalStack(_proposalStackClones)
                            _proposalStatus = getProposalStatus(
                                _proposalStreamDoc,
                                _templateStreamDoc
                            )
                            setProposalStatus(_proposalStatus)
                        }

                        // Register new submitted proposal if user is template author
                        if (
                            _proposalStreamDoc.content.isSubmitted &&
                            _latestProposalSubmission?.proposalCommitID !==
                                _proposalStreamDoc.commitId.toString() &&
                            currentUser.selfID.did.id ===
                                _proposalStackClones.template.author
                        ) {
                            console.log('Registered a new submission')
                            console.log(
                                'Was submitted',
                                _proposalStreamDoc.content.isSubmitted
                            )
                            console.log(
                                '_latestProposalSubmission?.proposalCommitID',
                                _latestProposalSubmission?.proposalCommitID
                            )
                            console.log(
                                '_proposalStreamDoc.commitId.toString()',
                                _proposalStreamDoc.commitId.toString()
                            )

                            console.log(
                                'is author',
                                currentUser.selfID.did.id ===
                                    _proposalStackClones.template.author
                            )

                            await ceramicStagehand.registerNewProposalSubmission(
                                _proposalStreamDoc,
                                _templateStreamDoc
                            )
                        }

                        // Init Input if editable
                        if (
                            (_proposalStatus === ProposalStatus.Draft ||
                                _proposalStatus ===
                                    ProposalStatus.ChangeRequested) &&
                            currentUser?.selfID.did.id ===
                                _proposalStreamDoc.content.author &&
                            _proposalStackClones
                        ) {
                            setProposalInput(
                                _.cloneDeep(_proposalStackClones.proposal)
                            )
                        }

                        setProposalStreamDoc(_proposalStreamDoc)
                        setTemplateStreamDoc(_templateStreamDoc)
                    }

                    setIsLoaded(true)
                } catch (e) {
                    cpLogger.push(e)
                }
            }
        }

        const saveProposal = async () => {
            if (proposalInput && ceramicStagehand && proposalStack) {
                if (!_.isEqual(proposalInput, proposalStack.proposal)) {
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
                setProposalInput(_.cloneDeep(proposalStack.proposal))
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
