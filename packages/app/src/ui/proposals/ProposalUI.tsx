import { useEffect, useState } from 'react'

import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'
import { Box } from 'grommet'
import InteractionLayout from '@cambrian/app/components/layout/InteractionLayout'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import Proposal from '@cambrian/app/classes/stages/Proposal'
import ProposalPreview from './ProposalPreview'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import { UserType } from '@cambrian/app/store/UserContext'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useProposalContext } from '@cambrian/app/hooks/useProposalContext'

const ProposalUI = () => {
    const { currentUser, isUserLoaded } = useCurrentUserContext()
    const { proposal } = useProposalContext()
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        if (proposal && isUserLoaded) init(proposal, currentUser)
    }, [proposal, isUserLoaded, currentUser])

    const init = async (_proposal: Proposal, user: UserType | null) => {
        if (
            _proposal.status === ProposalStatus.Submitted &&
            currentUser?.did === _proposal.template.content.author
        ) {
            await _proposal.receive()
        }

        if (
            _proposal.status === ProposalStatus.ChangeRequested &&
            _proposal.content.isSubmitted &&
            _proposal.content.author === currentUser?.did
        ) {
            await _proposal.receiveChangeRequest()
        }

        setIsInitialized(true)
    }

    return (
        <>
            {proposal && isInitialized ? (
                <InteractionLayout
                    contextTitle={
                        proposal.latestCommitDoc?.content.title ||
                        proposal.content.title
                    }
                    //actionBar={<ProposalActionbar />}
                >
                    <Box height={{ min: '80vh' }}>
                        <ProposalPreview
                            proposalDisplayData={
                                proposal.latestCommitDoc?.content ||
                                proposal.doc.content
                            }
                            proposal={proposal}
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
