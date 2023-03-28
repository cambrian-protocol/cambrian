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
import { Subscription } from 'rxjs'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useProposalContext } from '@cambrian/app/hooks/useProposalContext'

const ProposalUI = () => {
    const { currentUser, isUserLoaded } = useCurrentUserContext()
    const [isInitialized, setIsInitialized] = useState(false)
    const { proposal } = useProposalContext()
    useEffect(() => {
        if (proposal && isUserLoaded) init(proposal)
    }, [proposal, isUserLoaded, currentUser])

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

    const init = async (_proposal: Proposal) => {
        if (
            _proposal.status === ProposalStatus.Submitted &&
            currentUser?.did === _proposal.template.content.author
        ) {
            await _proposal.receive()
        }
        setIsInitialized(true)
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
