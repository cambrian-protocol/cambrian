import React, {
    PropsWithChildren,
    useCallback,
    useEffect,
    useState,
} from 'react'
import {
    addRecentStage,
    ceramicInstance,
    loadCommitWorkaround,
    loadStageDoc,
    loadStageStackFromID,
} from '../services/ceramic/CeramicUtils'
import {
    getApprovedProposalCommitID,
    getLatestProposalSubmission,
    getOnChainProposal,
    getOnChainProposalId,
    getProposalStatus,
} from '../utils/helpers/proposalHelper'

import { CAMBRIAN_DID } from 'packages/app/config'
import CeramicTemplateAPI from '../services/ceramic/CeramicTemplateAPI'
import { ProposalModel } from '../models/ProposalModel'
import { ProposalStatus } from '../models/ProposalStatus'
import ProposalsHub from '../hubs/ProposalsHub'
import { StageStackType } from '../ui/dashboard/ProposalsDashboardUI'
import { TemplateModel } from '../models/TemplateModel'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from './UserContext'
import _ from 'lodash'
import { cpLogger } from '../services/api/Logger.api'
import { ethers } from 'ethers'
import { solverSafetyCheck } from '../utils/helpers/safetyChecks'

export type ProposalContextType = {
    stageStack?: StageStackType
    proposalContract?: ethers.Contract
    proposalStatus?: ProposalStatus
    isLoaded: boolean
}

type ProposalProviderProps = PropsWithChildren<{}> & {
    proposalStreamDoc: TileDocument<ProposalModel>
    currentUser: UserType
}

export const ProposalContext = React.createContext<ProposalContextType>({
    proposalStatus: ProposalStatus.Unknown,
    isLoaded: false,
})

export const ProposalContextProvider: React.FunctionComponent<ProposalProviderProps> =
    ({ proposalStreamDoc, currentUser, children }) => {
        const proposalsHub = new ProposalsHub(
            currentUser.signer,
            currentUser.chainId
        )
        const [proposalStatus, setProposalStatus] = useState<ProposalStatus>()
        const [stageStack, setStageStack] = useState<StageStackType>()
        const [onChainProposal, setOnChainProposal] =
            useState<ethers.Contract>()
        const [isLoaded, setIsLoaded] = useState(false)
        const [templateStreamDoc, setTemplateStreamDoc] =
            useState<TileDocument<TemplateModel>>()

        useEffect(() => {
            init()
            safetyCheckSolver(stageStack)
        }, [])

        useEffect(() => {
            updateProposalLib()
        }, [proposalStatus, stageStack])

        // Init offchain Listeners
        useEffect(() => {
            if (
                proposalStatus === ProposalStatus.OnReview ||
                proposalStatus === ProposalStatus.ChangeRequested
            ) {
                if (proposalStreamDoc && templateStreamDoc) {
                    const proposalSub = proposalStreamDoc.subscribe(
                        async (x) => {
                            await initProposal(
                                proposalStreamDoc,
                                templateStreamDoc
                            )
                        }
                    )
                    const templateSub = templateStreamDoc.subscribe(
                        async (x) => {
                            setProposalStatus(
                                getProposalStatus(
                                    proposalStreamDoc.content,
                                    undefined,
                                    onChainProposal,
                                    templateStreamDoc.content.receivedProposals[
                                        proposalStreamDoc.id.toString()
                                    ]
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

        // Init onchain Listeners
        useEffect(() => {
            if (stageStack) {
                initProposalsHubListener(proposalsHub, stageStack)
                return () => {
                    proposalsHub.contract.removeAllListeners()
                }
            }
        }, [proposalStatus, stageStack])

        const safetyCheckSolver = useCallback(
            async (stageStack?: StageStackType) => {
                if (stageStack) {
                    solverSafetyCheck(stageStack, currentUser)
                }
            },
            [stageStack]
        )

        const updateProposalLib = async () => {
            if (stageStack && proposalStatus !== ProposalStatus.Unknown) {
                await addRecentStage(
                    currentUser,
                    proposalStreamDoc.id.toString()
                )
            }
        }

        const initProposalsHubListener = async (
            proposalsHub: ProposalsHub,
            stageStack: StageStackType
        ) => {
            const proposalID = getOnChainProposalId(
                stageStack.proposalCommitID,
                stageStack.proposal.template.commitID
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
                const _templateStreamDoc = await loadStageDoc<TemplateModel>(
                    currentUser,
                    proposalStreamDoc.content.template.streamID
                )

                await initProposal(proposalStreamDoc, _templateStreamDoc)

                setTemplateStreamDoc(_templateStreamDoc)
                setIsLoaded(true)
            } catch (e) {
                cpLogger.push(e)
            }
        }

        const initProposal = async (
            proposalStreamDoc: TileDocument<ProposalModel>,
            templateStreamDoc: TileDocument<TemplateModel>
        ) => {
            try {
                const proposalStreamID = proposalStreamDoc.id.toString()

                const cambrianStageStackDoc = (await TileDocument.deterministic(
                    ceramicInstance(currentUser),
                    {
                        controllers: [CAMBRIAN_DID],
                        family: 'cambrian-archive',
                        tags: [proposalStreamID],
                    }
                )) as TileDocument<{ proposalStack: StageStackType }>

                if (cambrianStageStackDoc.content.proposalStack) {
                    const stageStack = await loadStageStackFromID(
                        currentUser,
                        proposalStreamID,
                        cambrianStageStackDoc.content.proposalStack
                            .proposalCommitID
                    )

                    const onChainProposal = await getOnChainProposal(
                        currentUser,
                        cambrianStageStackDoc.content.proposalStack
                            .proposalCommitID,
                        cambrianStageStackDoc.content.proposalStack.proposal
                            .template.commitID
                    )

                    setProposalStatus(
                        getProposalStatus(
                            stageStack.proposal,
                            cambrianStageStackDoc.content.proposalStack,
                            onChainProposal
                        )
                    )
                    setOnChainProposal(onChainProposal)
                    setStageStack(stageStack)
                } else {
                    // Fallback in case cambrian-stageStack had no entry but there is an approved commit
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

                    const stageStack = await loadStageStackFromID(
                        currentUser,
                        proposalStreamID,
                        approvedCommitID
                    )

                    let receivedProposals =
                        templateStreamDoc.content.receivedProposals

                    // Register new submitted proposal if user is template author
                    if (
                        stageStack.template.author === currentUser.did &&
                        stageStack.proposal.isSubmitted
                    ) {
                        const ceramicTemplateAPI = new CeramicTemplateAPI(
                            currentUser
                        )
                        receivedProposals =
                            await ceramicTemplateAPI.registerNewProposalSubmission(
                                stageStack
                            )
                    }

                    setProposalStatus(
                        getProposalStatus(
                            stageStack.proposal,
                            undefined,
                            onChainProposal,
                            receivedProposals[proposalStreamID]
                        )
                    )
                    if (proposalStreamDoc.content.isSubmitted) {
                        setStageStack(stageStack)
                    } else {
                        const _latestProposalSubmission =
                            getLatestProposalSubmission(
                                proposalStreamID,
                                templateStreamDoc.content.receivedProposals
                            )
                        if (_latestProposalSubmission) {
                            // Initialize the latest submission/commit as stageStack
                            const latestProposalCommitContent = (
                                await loadCommitWorkaround(
                                    currentUser,
                                    _latestProposalSubmission.proposalCommitID
                                )
                            ).content as ProposalModel
                            setStageStack({
                                ...stageStack,
                                proposal: latestProposalCommitContent,
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
                    stageStack: stageStack,
                    proposalStatus: proposalStatus,
                    proposalContract: onChainProposal,
                    isLoaded: isLoaded,
                }}
            >
                {children}
            </ProposalContext.Provider>
        )
    }
