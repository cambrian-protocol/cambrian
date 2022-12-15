import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react'
import {
    loadStageDoc,
    loadStageStackFromID,
} from '../services/ceramic/CeramicUtils'
import {
    getApprovedProposalCommitID,
    getOnChainProposalId,
    getProposalStatus,
} from '../utils/helpers/proposalHelper'

import { ProposalModel } from '../models/ProposalModel'
import { ProposalStatus } from '../models/ProposalStatus'
import ProposalsHub from '../hubs/ProposalsHub'
import { StageStackType } from '../ui/dashboard/ProposalsDashboardUI'
import {
    ReceivedProposalCommitType,
    TemplateModel,
} from '../models/TemplateModel'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { TokenAPI } from '../services/api/Token.api'
import { TokenModel } from '../models/TokenModel'
import { UserType } from './UserContext'
import _ from 'lodash'
import { ethers } from 'ethers'
import CeramicTemplateAPI from '../services/ceramic/CeramicTemplateAPI'
import usePrevious from '../hooks/usePrevious'

export type ProposalContextType = {
    stageStack?: StageStackType | null
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
        const [stageStack, setStageStack] = useState<
            StageStackType | undefined | null
        >()
        const [onChainProposal, setOnChainProposal] =
            useState<ethers.Contract>()
        const [onChainProposalID, setOnChainProposalID] = useState<string>()
        const [templateStreamDoc, setTemplateStreamDoc] =
            useState<TileDocument<TemplateModel>>()
        const [collateralToken, setCollateralToken] = useState<TokenModel>()
        const [receivedProposals, setReceivedProposals] =
            useState<ReceivedProposalCommitType[]>()

        const ceramicTemplateAPI = new CeramicTemplateAPI(currentUser)
        const prevTemplate = usePrevious(templateStreamDoc?.content)

        const isLoaded = useMemo(
            () =>
                typeof proposalStatus != undefined &&
                typeof templateStreamDoc != undefined &&
                typeof stageStack != undefined &&
                typeof receivedProposals != undefined,
            [proposalStatus, templateStreamDoc, stageStack, receivedProposals]
        )

        useEffect(() => {
            const updateTemplate = async () => {
                setTemplateStreamDoc(await getTemplate())
            }
            updateTemplate()
        }, [])

        useEffect(() => {
            setCanonicalProposalCommitID(getCanonicalProposalCommitID())
        }, [templateStreamDoc])

        useEffect(() => {
            const updateStageStack = async () => {
                setStageStack(await getStageStack())
            }
            updateStageStack()
        }, [canonicalProposalCommitID, receivedProposals])

        useEffect(() => {
            const updateReceivedProposals = async () => {
                setReceivedProposals(await registerNewProposals())
            }

            const updateCollateralToken = async () => {
                setCollateralToken(await getCollateralToken())
            }

            updateReceivedProposals()
            updateCollateralToken()
        }, [stageStack])

        useEffect(() => {
            setProposalStatus(_getProposalStatus())
            setOnChainProposalID(getOnChainProposalID())
        }, [receivedProposals, onChainProposal])

        useEffect(() => {
            listenOnChain() // listens on proposalsHub.contract
            return () => {
                proposalsHub.contract.removeAllListeners()
            }
        }, [proposalStatus])

        useEffect(() => {
            if (
                templateStreamDoc &&
                !_.isEqual(templateStreamDoc?.content, prevTemplate)
            ) {
                const listeners = listenOffChain()
                return () => {
                    listeners?.proposal?.unsubscribe()
                    listeners?.template?.unsubscribe()
                }
            }
        }, [proposalStatus])

        const getTemplate = async () => {
            return await loadStageDoc<TemplateModel>(
                currentUser,
                proposalStreamDoc.content.template.streamID
            )
        }

        const getCanonicalProposalCommitID = () => {
            return templateStreamDoc
                ? isProposalFinalized()
                    ? getApprovedProposalCommitID(
                          templateStreamDoc.content,
                          proposalStreamDoc.id.toString()
                      )
                    : isProposalSubmitted()
                    ? proposalStreamDoc.commitId.toString()
                    : undefined
                : undefined
        }

        const getStageStack = () => {
            return canonicalProposalCommitID
                ? loadStageStackFromID(
                      proposalStreamDoc.id.toString(),
                      canonicalProposalCommitID
                  )
                : null
        }

        // Might be async later when we do NEEDED defensive checking
        const getOnChainProposalID = () => {
            return stageStack
                ? getOnChainProposalId(
                      stageStack.proposalCommitID,
                      stageStack.proposal.template.commitID
                  )
                : undefined
        }

        const _getProposalStatus = () => {
            return getProposalStatus(
                stageStack?.proposal || proposalStreamDoc.content,
                (stageStack &&
                    getApprovedProposalCommitID(
                        stageStack.template,
                        proposalStreamDoc.id.toString()
                    ) &&
                    stageStack) ||
                    undefined,
                onChainProposal,
                receivedProposals
            )
        }

        // Register new submitted proposal if user is template author
        const registerNewProposals = async () => {
            if (stageStack && isTemplateAuthor() && isProposalSubmitted()) {
                return (
                    await ceramicTemplateAPI.registerNewProposalSubmission(
                        stageStack
                    )
                )[proposalStreamDoc.id.toString()]
            }
        }

        const getCollateralToken = async () => {
            return TokenAPI.getTokenInfo(
                stageStack?.proposal.price.tokenAddress ||
                    proposalStreamDoc.content.price.tokenAddress,
                currentUser.web3Provider,
                currentUser.chainId
            )
        }

        const listenOffChain = () => {
            if (
                proposalStatus === ProposalStatus.OnReview ||
                proposalStatus === ProposalStatus.ChangeRequested
            ) {
                return {
                    proposal: proposalStreamDoc.subscribe(async (x) => {
                        setTemplateStreamDoc(await getTemplate())
                    }),
                    template: templateStreamDoc?.subscribe(async (x) => {
                        setTemplateStreamDoc(await getTemplate())
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

        const isTemplateAuthor = () => {
            return stageStack && stageStack.template.author === currentUser.did
        }

        const isProposalSubmitted = () => {
            return proposalStreamDoc.content.isSubmitted
        }

        const isProposalFinalized = () => {
            return proposalStatus && proposalStatus >= ProposalStatus.Canceled
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
