import React, { PropsWithChildren, useEffect, useState } from 'react'
import {
    loadStageDoc,
    loadStageStackFromID,
} from '../services/ceramic/CeramicUtils'
import {
    getApprovedProposalCommitID,
    getLatestProposalSubmission,
    getOnChainProposalId,
    getProposalStatus,
} from '../utils/helpers/proposalHelper'

import { ProposalModel } from '../models/ProposalModel'
import { ProposalStatus } from '../models/ProposalStatus'
import ProposalsHub from '../hubs/ProposalsHub'
import { StageStackType } from '../ui/dashboard/ProposalsDashboardUI'
import { TemplateModel } from '../models/TemplateModel'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { TokenAPI } from '../services/api/Token.api'
import { TokenModel } from '../models/TokenModel'
import { UserType } from './UserContext'
import _ from 'lodash'
import { cpLogger } from '../services/api/Logger.api'
import { ethers } from 'ethers'

export type ProposalContextType = {
    stageStack?: StageStackType
    proposalContract?: ethers.Contract
    proposalStatus?: ProposalStatus
    collateralToken?: TokenModel
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
        const [canonicalProposalCommitID, setCanonicalProposalCommitID] =
            useState<string | undefined>()
        const [proposalStatus, setProposalStatus] = useState<ProposalStatus>()
        const [stageStack, setStageStack] = useState<StageStackType>()
        const [onChainProposal, setOnChainProposal] =
            useState<ethers.Contract>()
        const [onChainProposalID, setOnChainProposalID] = useState<string>()
        const [templateStreamDoc, setTemplateStreamDoc] =
            useState<TileDocument<TemplateModel>>()
        const [collateralToken, setCollateralToken] = useState<TokenModel>()
        const [isLoaded, setIsLoaded] = useState(false)

        useEffect(() => {
            update()
        }, [])

        // kicks off chain of updates
        // loadTemplate -> setCanonicalProposalCommitID -> loadStageStack -> updateOnChainProposalID & updateProposalStatus & updateCollateralToken
        const update = async () => {
            try {
                loadTemplate()
            } catch (e) {
                console.error(e)
                cpLogger.push(e)
            }
        }

        useEffect(() => {
            loadStageStack()
        }, [canonicalProposalCommitID])

        useEffect(() => {
            updateProposalStatus()
            updateCollateralToken()
            updateOnChainProposalID()
        }, [stageStack, onChainProposal])

        useEffect(() => {
            const listeners = listenOffChain()
            return () => {
                listeners?.proposal?.unsubscribe()
                listeners?.template?.unsubscribe()
            }
        }, [templateStreamDoc, proposalStatus])

        useEffect(() => {
            listenOnChain() // listens on proposalsHub.contract
            return () => {
                proposalsHub.contract.removeAllListeners()
            }
        }, [proposalStatus, stageStack])

        useEffect(() => {
            if (templateStreamDoc) {
                setCanonicalProposalCommitID(
                    // approved || most recent || undefined
                    getApprovedProposalCommitID(
                        templateStreamDoc.content,
                        proposalStreamDoc.id.toString()
                    ) ||
                        getLatestProposalSubmission(
                            proposalStreamDoc.id.toString(),
                            templateStreamDoc.content.receivedProposals
                        )?.proposalCommitID
                )
            }
        }, [templateStreamDoc])

        const loadTemplate = async () => {
            setTemplateStreamDoc(
                await loadStageDoc<TemplateModel>(
                    currentUser,
                    proposalStreamDoc.content.template.streamID
                )
            )
        }

        const loadStageStack = async () => {
            setStageStack(
                await loadStageStackFromID(
                    proposalStreamDoc.id.toString(),
                    canonicalProposalCommitID
                )
            )
            setIsLoaded(true)
        }

        // Might be async later when we do NEEDED defensive checking
        const updateOnChainProposalID = () => {
            setOnChainProposalID(
                stageStack
                    ? getOnChainProposalId(
                          stageStack.proposalCommitID,
                          stageStack.proposal.template.commitID
                      )
                    : undefined
            )
        }

        const updateProposalStatus = () => {
            if (onChainProposal) {
                onChainProposal.isExecuted
                    ? setProposalStatus(ProposalStatus.Executed)
                    : setProposalStatus(ProposalStatus.Funding)
            } else if (stageStack) {
                setProposalStatus(
                    getProposalStatus(
                        stageStack.proposal,
                        (getApprovedProposalCommitID(
                            stageStack.template,
                            proposalStreamDoc.id.toString()
                        ) &&
                            stageStack) ||
                            undefined
                    )
                )
            } else {
                setProposalStatus(getProposalStatus(proposalStreamDoc.content))
            }
        }

        const updateCollateralToken = async () => {
            setCollateralToken(
                await TokenAPI.getTokenInfo(
                    stageStack?.proposal.price.tokenAddress ||
                        proposalStreamDoc.content.price.tokenAddress,
                    currentUser.web3Provider,
                    currentUser.chainId
                )
            )
        }

        const listenOffChain = () => {
            if (
                proposalStatus === ProposalStatus.OnReview ||
                proposalStatus === ProposalStatus.ChangeRequested
            ) {
                return {
                    proposal: proposalStreamDoc.subscribe(async (x) => {
                        await update()
                    }),
                    template: templateStreamDoc?.subscribe(async (x) => {
                        await update()
                    }),
                }
            }
        }

        // TODO IMPORTANT: CHECK that gotten proposal MATCHES expectations
        // If an attacker calculates this proposalID and creates a bad one while user on this page...
        const listenOnChain = () => {
            if (onChainProposalID) {
                proposalsHub.contract.on(
                    proposalsHub.contract.filters.CreateProposal(
                        onChainProposalID
                    ),
                    async () => {
                        setOnChainProposal(
                            await proposalsHub.getProposal(onChainProposalID)
                        )
                    }
                )

                proposalsHub.contract.on(
                    proposalsHub.contract.filters.ExecuteProposal(
                        onChainProposalID
                    ),
                    async () => {
                        setOnChainProposal(
                            await proposalsHub.getProposal(onChainProposalID)
                        )
                    }
                )
            }
        }

        return (
            <ProposalContext.Provider
                value={{
                    stageStack: stageStack,
                    proposalStatus: proposalStatus,
                    proposalContract: onChainProposal,
                    collateralToken: collateralToken,
                    isLoaded: isLoaded,
                }}
            >
                {children}
            </ProposalContext.Provider>
        )
    }
