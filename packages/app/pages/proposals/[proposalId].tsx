import { useEffect, useState } from 'react'

import { BaseLayout } from '@cambrian/app/components/layout/BaseLayout'
import InvalidCIDUI from '@cambrian/app/ui/general/InvalidCIDUI'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import ProposalUI from '@cambrian/app/ui/proposals/ProposalUI'
import ProposalsHub from '@cambrian/app/hubs/ProposalsHub'
import { StageNames } from '@cambrian/app/classes/Stagehand'
import { ethers } from 'ethers'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useRouter } from 'next/dist/client/router'

export default function ProposalPage() {
    const router = useRouter()
    const { proposalId } = router.query
    const { currentUser, login } = useCurrentUser()

    const [proposalsHub, setProposalsHub] = useState<ProposalsHub>()
    const [proposal, setCurrentProposal] = useState<ethers.Contract>()

    const [isInvalidCID, setIsInvalidCID] = useState(false)

    useEffect(() => {
        if (!currentUser) {
            getLogin()
        }
    }, [currentUser])

    useEffect(() => {
        if (router.isReady && currentUser) fetchProposal()
    }, [router, currentUser])

    const getLogin = async () => {
        await login()
    }

    const fetchProposal = async () => {
        // Fetch proposal from proposalsHub via proposalId
        if (
            proposalId !== undefined &&
            typeof proposalId === 'string' &&
            currentUser
        ) {
            const proposalsHub = new ProposalsHub(currentUser.signer)
            setProposalsHub(proposalsHub)
            setCurrentProposal(await proposalsHub.getProposal(proposalId))
        }
        setIsInvalidCID(true)
    }

    return (
        <BaseLayout contextTitle="Proposal">
            {proposal && proposalsHub ? (
                <ProposalUI proposal={proposal} proposalsHub={proposalsHub} />
            ) : isInvalidCID ? (
                <InvalidCIDUI stageName={StageNames.proposal} />
            ) : (
                <LoadingScreen context="Loading composition" />
            )}
        </BaseLayout>
    )
}
