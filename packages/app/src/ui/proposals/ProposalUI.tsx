import { useEffect, useState } from 'react'

import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'
import { Box } from 'grommet'
import InteractionLayout from '@cambrian/app/components/layout/InteractionLayout'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import Proposal from '@cambrian/app/classes/stages/Proposal'
import ProposalBody from './ProposalBody'
import ProposalHeader from '@cambrian/app/components/layout/header/ProposalHeader'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useProposalContext } from '@cambrian/app/hooks/useProposalContext'

const ProposalUI = () => {
    const { currentUser, isUserLoaded } = useCurrentUserContext()
    const { proposal } = useProposalContext()
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        if (proposal && isUserLoaded) init(proposal)
    }, [proposal, isUserLoaded, currentUser])

    const init = async (_proposal: Proposal) => {
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
                    contextTitle={proposal.content.title}
                    //actionBar={<ProposalActionbar />}
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
