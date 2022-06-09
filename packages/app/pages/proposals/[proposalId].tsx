import { useEffect, useState } from 'react'

import ConnectWalletSection from '@cambrian/app/components/sections/ConnectWalletSection'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import InvalidQueryComponent from '@cambrian/app/components/errors/InvalidQueryComponent'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import ProposalUI from '@cambrian/app/ui/proposals/ProposalUI'
import ProposalsHub from '@cambrian/app/hubs/ProposalsHub'
import { StageNames } from '@cambrian/app/classes/Stagehand'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
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
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

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
                setProposalsHub(proposalsHub)
                const proposal = await proposalsHub.getProposal(
                    proposalId as string
                )
                return setCurrentProposal(proposal)
            } catch (e) {
                setErrorMessage(await cpLogger.push(e))
            }
        }
        setShowInvalidQueryComponent(true)
    }

    return (
        <>
            {currentUser.signer ? (
                showInvalidQueryComponent ? (
                    <PageLayout contextTitle="Invalid Query">
                        <InvalidQueryComponent context={StageNames.proposal} />
                    </PageLayout>
                ) : proposalsHub && currentProposal ? (
                    <PageLayout contextTitle="Proposal">
                        <ProposalUI
                            currentUser={currentUser}
                            proposal={currentProposal}
                            proposalsHub={proposalsHub}
                        />
                    </PageLayout>
                ) : (
                    <LoadingScreen context={LOADING_MESSAGE['PROPOSAL']} />
                )
            ) : (
                <PageLayout contextTitle="Connect Wallet">
                    <ConnectWalletSection />
                </PageLayout>
            )}
            {errorMessage && (
                <ErrorPopupModal
                    onClose={() => setErrorMessage(undefined)}
                    errorMessage={errorMessage}
                />
            )}
        </>
    )
}
