import { useEffect, useState } from 'react'

import { AppbarItem } from '@cambrian/app/components/nav/AppbarItem'
import { BaseLayout } from '@cambrian/app/components/layout/BaseLayout'
import { CoinVertical } from 'phosphor-react'
import ConnectWalletSection from '@cambrian/app/components/sections/ConnectWallet'
import { ERC20_IFACE } from 'packages/app/config/ContractInterfaces'
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
                setProposalsHub(proposalsHub)
                const proposal = await proposalsHub.getProposal(
                    proposalId as string
                )
                return setCurrentProposal(proposal)
            } catch (e: any) {
                console.error(e)
                setErrorMessage(e.message)
            }
        }
        setShowInvalidQueryComponent(true)
    }

    // Temporarily added for demo purposes
    const onMintTOY = async () => {
        if (currentUser.signer) {
            const ToyToken = new ethers.Contract(
                '0x4c7C2e0e069497D559fc74E0f53E88b5b889Ee79',
                ERC20_IFACE,
                currentUser.signer
            )
            await ToyToken.mint(currentUser.address, '1000000000000000000000')
        }
    }

    return (
        <>
            <BaseLayout
                contextTitle="Proposal"
                appbarItems={[
                    <AppbarItem icon={<CoinVertical />} onClick={onMintTOY} />,
                ]}
            >
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
