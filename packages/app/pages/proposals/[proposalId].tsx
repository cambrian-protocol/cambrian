import { useEffect, useState } from 'react'

import { BaseLayout } from '@cambrian/app/components/layout/BaseLayout'
import ConnectWalletSection from '@cambrian/app/components/sections/ConnectWallet'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import InvalidQueryComponent from '@cambrian/app/components/errors/InvalidQueryComponent'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
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
    const { currentUser } = useCurrentUser()

    const [proposalsHub, setProposalsHub] = useState<ProposalsHub>()
    const [currentProposal, setCurrentProposal] = useState<ethers.Contract>()
    const [showInvalidQueryComponent, setShowInvalidQueryComponent] =
        useState(false)
    const [errorMessage, setErrorMessage] = useState<string>()

    useEffect(() => {
        if (router.isReady && currentUser.signer !== undefined) fetchProposal()
    }, [router, currentUser])

    const fetchProposal = async () => {
        // Fetch proposal from proposalsHub via proposalId
        if (
            proposalId !== undefined &&
            typeof proposalId === 'string' &&
            currentUser.signer &&
            currentUser.chainId
        ) {
            try {
                const proposalsHub = new ProposalsHub(
                    currentUser.signer,
                    currentUser.chainId
                )
                console.log('Proposal Id:', proposalId)
                console.log('ProposalsHub:', proposalsHub)
                console.log('Current User:', currentUser)
                setProposalsHub(proposalsHub)
                const proposal = await proposalsHub.getProposal(
                    proposalId as string
                )
                console.log('Fetched proposal:', proposal)
                return setCurrentProposal(proposal)
            } catch (e: any) {
                console.error(e)
                setErrorMessage(e.message)
            }
        }
        setShowInvalidQueryComponent(true)
    }

    return (
        <>
            <BaseLayout contextTitle="Proposal">
                {currentUser.signer ? (
                    showInvalidQueryComponent ? (
                        <InvalidQueryComponent context={StageNames.proposal} />
                    ) : proposalsHub && currentProposal ? (
                        <ProposalUI
                            currentUser={currentUser}
                            proposal={currentProposal}
                            proposalsHub={proposalsHub}
                        />
                    ) : (
                        <LoadingScreen context={LOADING_MESSAGE['PROPOSAL']} />
                    )
                ) : (
                    <ConnectWalletSection />
                )}
            </BaseLayout>
            {errorMessage && (
                <ErrorPopupModal
                    onClose={() => setErrorMessage(undefined)}
                    errorMessage={errorMessage}
                />
            )}
        </>
    )
}
