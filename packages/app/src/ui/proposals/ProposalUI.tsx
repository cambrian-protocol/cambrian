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

/* 
    Following scenario: I am building a react typescript app. I have a class named Proposal, this class has a property named status. I am not using the render function in this class. The status can update and depends on two other props named proposalDoc and templateDoc, these are passed into the consturctor. Within the Proposal class I have a function called refreshDocs, this function updates the proposalDoc and the templateDoc and calculates the new status from the updated docs.

    Now I have a react context in which stores a state with an instance of this Proposal class and is used at many places in my application. I am now trying to subscribe to the proposalDoc, which is stored on Ceramic and would like to call the refreshDoc function whenever the proposal receives an update. As I would like to isolate the usage of Ceramic I have created this function: 

     subscribe: async (streamId: string, onChange: (next: any) => void) => {
        try {
            const readOnlyCeramicClient = new CeramicClient(CERAMIC_NODE_ENDPOINT)
            const tileDoc = await TileDocument.load(
                readOnlyCeramicClient,
                streamId
            )
            return tileDoc.subscribe(async (x) => {
                onChange(x)
            })
        } catch (e) {
            console.error(e)
        }
    }

    This is the code of my FE component:
        const ProposalUI = () => {

        const { proposal } = useProposalContext()

        useEffect(() => {
        let proposalSubscription: Subscription | undefined

        const initProposalSubscription = async () => {
            if (proposal) {
                proposalSubscription = await API.doc.subscribe(
                    proposal.doc.streamID,
                    (streamState) => {
                        if (streamState.next) {
                            proposal.refreshProposalContent(
                                streamState.next.content
                            )
                        }
                    }
                )
            }
        }

        initProposalSubscription()

        return () => {
            if (proposalSubscription) {
                proposalSubscription.unsubscribe()
            }
        }
    }, [proposal?.doc.streamID])

     return (
        <>
            {proposal && isInitialized ? (
                <InteractionLayout
                    contextTitle={proposal.content.title}
                    actionBar={<ProposalActionbar />}
                >
                    <Box height={{ min: '80vh' }} gap="medium">
                        <ProposalHeader proposal={proposal} />
                        <ProposalBody
                            proposalContent={proposal.content}
                            collateralToken={
                                proposal.collateralToken
                            }
                        />
                    </Box>
                </InteractionLayout>
            ) : (
                null
            )}
        </>
    )
}

    Tell me why I am not seeing updates on my proposal at my frontend and how to fix it. 



    
    
    
    */
