import { Box, Button } from 'grommet'
import { useEffect, useState } from 'react'

import { BaseLayout } from '@cambrian/app/components/layout/BaseLayout'
import FundProposal from '@cambrian/app/src/ui/proposals/FundProposal'
import HeaderTextSection from '@cambrian/app/src/components/sections/HeaderTextSection'
import Link from 'next/link'
import ParticipantAvatar from '@cambrian/app/src/components/avatars/AvatarWithTitle'
import { ProposalModel } from '@cambrian/app/src/models/ProposalModel'
import { ProposalsHubAPI } from '@cambrian/app/src/services/api/ProposalsHub.api'
import { useRouter } from 'next/dist/client/router'

export default function ProposalPage() {
    const [currentProposal, setCurrentProposal] = useState<ProposalModel>()

    const router = useRouter()
    const { proposalId } = router.query

    useEffect(() => {
        if (!router.isReady) return

        if (proposalId !== undefined && typeof proposalId === 'string') {
            ProposalsHubAPI.getProposalFromProposalId(proposalId)
                .then((res) => setCurrentProposal(res.proposal))
                .catch((err) => {
                    console.error('Error while loading proposal', err)
                    router.push('/404')
                })
        } else {
            console.error('No proposal identifier found')
            router.push('/404')
        }

        /* 
        TODO setIsExecuted
        const solution = await this.IPFSSolutionsHub.solutions(solutionId);
        setIsExectued(solution.executed)
        */
    }, [router])

    return (
        <>
            {currentProposal && (
                <BaseLayout contextTitle="Proposal">
                    <Box>
                        <HeaderTextSection
                            title={currentProposal.title}
                            subTitle="Project Overview"
                            paragraph={currentProposal.description}
                        />
                        <Box direction="row" height={{ min: 'auto' }}>
                            <ParticipantAvatar
                                title={currentProposal.solution.seller.name}
                                pfpPath={currentProposal.solution.seller.pfp}
                                icon={currentProposal.solution.seller.icon}
                                role="Seller"
                            />
                            <ParticipantAvatar
                                title={currentProposal.buyer.name}
                                pfpPath={currentProposal.buyer.pfp}
                                icon={currentProposal.buyer.icon}
                                role="Buyer"
                            />
                        </Box>
                        <Box fill>
                            {currentProposal.solution.isExecuted ? (
                                <Link
                                    href={`/proposals/${proposalId}/interaction`}
                                >
                                    <Button label="Visit" primary />
                                </Link>
                            ) : (
                                <FundProposal proposal={currentProposal} />
                            )}
                        </Box>
                    </Box>
                </BaseLayout>
            )}
        </>
    )
}
