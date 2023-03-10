import { useEffect, useState } from 'react'

import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'
import { Box } from 'grommet'
import InteractionLayout from '@cambrian/app/components/layout/InteractionLayout'
import Messenger from '@cambrian/app/components/messenger/Messenger'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import ProposalActionbar from '@cambrian/app/components/bars/actionbars/proposal/ProposalActionbar'
import ProposalPreview from './ProposalPreview'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useProposalContext } from '@cambrian/app/hooks/useProposalContext'

const ProposalUI = () => {
    const { currentUser } = useCurrentUserContext()
    const { proposal } = useProposalContext()
    const [showMessenger, setShowMessenger] = useState(false)

    useEffect(() => {
        if (
            currentUser &&
            proposal &&
            proposal.status !== ProposalStatus.Draft
        ) {
            setShowMessenger(
                currentUser.did === proposal.doc.content.author ||
                    currentUser.did === proposal.template.content.author
            )
        }
    }, [proposal, currentUser])

    /* TODO 
    View restrictions when on DRAFT
    Display latest proposal commit when on MODIFIED or CHANGE_REQUESTED
    receive Proposal as Templater
    receiveChangeRequest as Proposer
    */

    return (
        <>
            {proposal ? (
                <InteractionLayout
                    contextTitle={proposal.content.title}
                    actionBar={
                        <ProposalActionbar
                            proposedPrice={{
                                amount: proposal.content.price.amount || '',
                                token: proposal.collateralToken,
                            }}
                            messenger={
                                showMessenger ? (
                                    <Messenger
                                        chatID={proposal.doc.streamID}
                                        currentUser={currentUser!}
                                        participantDIDs={[
                                            proposal.content.author,
                                            proposal.template.content.author,
                                        ]}
                                    />
                                ) : undefined
                            }
                        />
                    }
                >
                    <Box height={{ min: '80vh' }}>
                        <ProposalPreview
                            proposal={proposal}
                            showConfiguration
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
