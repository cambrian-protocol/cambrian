import { useEffect, useState } from 'react'

import { BaseLayout } from '@cambrian/app/components/layout/BaseLayout'
import InvalidCIDUI from '@cambrian/app/ui/general/InvalidCIDUI'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import ProposalUI from '@cambrian/app/ui/proposals/ProposalUI'
import { StageNames } from '@cambrian/app/classes/Stagehand'
import { ethers } from 'ethers'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useProposalsHub } from '@cambrian/app/hooks/useProposalsHub'
import { useRouter } from 'next/dist/client/router'

export default function ProposalPage() {
    const router = useRouter()
    const { proposalId } = router.query
    const { currentUser, login } = useCurrentUser()

    const { proposalsHubContract, getProposal } = useProposalsHub()
    const [currentProposal, setCurrentProposal] = useState<ethers.Contract>()

    const [isInvalidCID, setIsInvalidCID] = useState(false)

    useEffect(() => {
        if (!currentUser) {
            getLogin()
        }
    }, [currentUser])

    useEffect(() => {
        if (router.isReady && proposalsHubContract) fetchProposal()
    }, [router, proposalsHubContract])

    const getLogin = async () => {
        await login()
    }

    const fetchProposal = async () => {
        // Fetch proposal from proposalsHub via proposalId
        if (proposalId !== undefined && typeof proposalId === 'string') {
            const proposalContract = await getProposal(proposalId)
            if (proposalContract) return setCurrentProposal(proposalContract)
        }
        setIsInvalidCID(true)
    }

    return (
        <BaseLayout contextTitle="Proposal">
            {currentProposal ? (
                <ProposalUI
                    proposal={currentProposal}
                    proposalId={proposalId as string}
                />
            ) : isInvalidCID ? (
                <InvalidCIDUI stageName={StageNames.proposal} />
            ) : (
                <LoadingScreen context="Loading composition" />
            )}
        </BaseLayout>
    )
}
