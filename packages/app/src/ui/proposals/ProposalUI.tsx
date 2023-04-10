import { useEffect, useState } from 'react'

import API from '@cambrian/app/services/api/cambrian.api'
import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'
import { Box } from 'grommet'
import InteractionLayout from '@cambrian/app/components/layout/InteractionLayout'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import Proposal from '@cambrian/app/classes/stages/Proposal'
import ProposalActionbar from '@cambrian/app/components/bars/actionbars/proposal/ProposalActionbar'
import ProposalBody from './ProposalBody'
import ProposalHeader from '@cambrian/app/components/layout/header/ProposalHeader'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import ProposalsHub from '@cambrian/app/hubs/ProposalsHub'
import { Subscription } from 'rxjs'
import { getOnChainProposalId } from '@cambrian/app/utils/proposal.utils'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useProposalContext } from '@cambrian/app/hooks/useProposalContext'

const RECEIVE_DELAY_MS = 30000

const ProposalUI = () => {
    const { currentUser, isUserLoaded } = useCurrentUserContext()
    const [isInitialized, setIsInitialized] = useState(false)
    const { proposal } = useProposalContext()
    const [savedCalls, setSavedCalls] = useState<(() => Promise<void>)[]>([])
    let lastReceiveTime = 0

    useEffect(() => {
        if (proposal && isUserLoaded) {
            init(proposal)
        }
    }, [proposal, isUserLoaded, currentUser])

    useEffect(() => {
        if (savedCalls.length > 0) {
            // Process saved calls after 30 seconds
            setTimeout(async () => {
                const calls = savedCalls.splice(0, savedCalls.length)
                for (const call of calls) {
                    await call()
                }
            }, 30000)
        }
    }, [savedCalls])

    const init = async (_proposal: Proposal) => {
        if (
            _proposal.status === ProposalStatus.Submitted &&
            currentUser?.did === _proposal.template.content.author
        ) {
            const currentTime = Date.now()
            if (currentTime - lastReceiveTime > RECEIVE_DELAY_MS) {
                lastReceiveTime = currentTime
                await _proposal.receive()
                setSavedCalls([])
            } else {
                setSavedCalls((calls) => [...calls, () => _proposal.receive()])
            }
        }
        setIsInitialized(true)
    }

    useEffect(() => {
        let proposalSubscription: Subscription | undefined
        let templateSubscription: Subscription | undefined

        const initProposalSubscription = async () => {
            if (proposal) {
                proposalSubscription = await API.doc.subscribe(
                    proposal.doc.streamID,
                    (streamState, newCommitID) => {
                        if (streamState.next) {
                            const metadata = proposal.doc.metadata
                                ? proposal.doc.metadata
                                : undefined

                            proposal.refreshProposalDoc({
                                commitID: newCommitID,
                                content: streamState.next.content,
                                streamID: proposal.doc.streamID,
                                metadata: metadata,
                            })
                            init(proposal)
                        }
                    }
                )
            }
        }

        const initTemplateSubscription = async () => {
            if (proposal) {
                templateSubscription = await API.doc.subscribe(
                    proposal.template.doc.streamID,
                    (streamState, newCommitID) => {
                        if (streamState.next) {
                            const metadata = proposal.template.doc.metadata
                                ? proposal.template.doc.metadata
                                : undefined

                            proposal.refreshTemplateDoc({
                                commitID: newCommitID,
                                content: streamState.next.content,
                                streamID: proposal.template.doc.streamID,
                                metadata: metadata,
                            })
                        }
                    }
                )
            }
        }

        initProposalSubscription()

        if (currentUser?.did !== proposal?.template.content.author) {
            initTemplateSubscription()
        }

        return () => {
            if (proposalSubscription) {
                proposalSubscription.unsubscribe()
            }
            if (templateSubscription) {
                templateSubscription.unsubscribe()
            }
        }
    }, [proposal?.doc.streamID])

    // Init onchain Listeners
    useEffect(() => {
        if (proposal && proposal.auth) {
            const proposalsHub = new ProposalsHub(
                proposal.auth.signer,
                proposal.auth.chainId
            )

            initProposalsHubListener(proposalsHub, proposal)
            return () => {
                proposalsHub.contract.removeAllListeners()
            }
        }
    }, [proposal?.status])

    const initProposalsHubListener = async (
        _proposalsHub: ProposalsHub,
        _proposal: Proposal
    ) => {
        if (!_proposal.latestCommitDoc) return

        const proposalId = getOnChainProposalId(
            _proposal.latestCommitDoc.commitID,
            _proposal.latestCommitDoc.content.template.commitID
        )
        if (_proposal.status === ProposalStatus.Approved) {
            _proposalsHub.contract.on(
                _proposalsHub.contract.filters.CreateProposal(proposalId),
                async () => {
                    _proposal.setOnChainProposal(
                        await _proposalsHub.getProposal(proposalId)
                    )
                }
            )
        } else if (_proposal.status === ProposalStatus.Funding) {
            _proposalsHub.contract.on(
                _proposalsHub.contract.filters.ExecuteProposal(proposalId),
                async () => {
                    _proposal.setOnChainProposal(
                        await _proposalsHub.getProposal(proposalId)
                    )
                }
            )
        }
    }

    return (
        <>
            {proposal && isInitialized ? (
                <InteractionLayout
                    contextTitle={proposal.content.title}
                    actionBar={<ProposalActionbar proposal={proposal} />}
                >
                    <Box height={{ min: '80vh' }} gap="medium">
                        <ProposalHeader proposal={proposal} />
                        <ProposalBody
                            proposalContent={proposal.content}
                            collateralToken={proposal.collateralToken}
                        />
                    </Box>
                </InteractionLayout>
            ) : (
                <InteractionLayout contextTitle={'Loading...'}>
                    <Box gap="medium">
                        <BaseSkeletonBox height={'xsmall'} width={'50%'} />
                        <BaseSkeletonBox height={'xxsmall'} width={'100%'} />
                        <PlainSectionDivider />
                        <BaseSkeletonBox height={'medium'} width={'100%'} />
                    </Box>
                </InteractionLayout>
            )}
        </>
    )
}

export default ProposalUI
