import ConnectWalletSection from '@cambrian/app/components/sections/ConnectWalletSection'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import { ProposalContextProvider } from '@cambrian/app/store/ProposalContext'
import ProposalUI from '@cambrian/app/ui/proposals/ProposalUI'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useRouter } from 'next/router'

export default function ViewProposalPage() {
    const { currentUser, isUserLoaded } = useCurrentUser()
    const router = useRouter()
    const { proposalStreamID } = router.query

    return (
        <>
            {isUserLoaded && !currentUser ? (
                <PageLayout contextTitle="Connect your Wallet">
                    <ConnectWalletSection />
                </PageLayout>
            ) : currentUser ? (
                <ProposalContextProvider
                    currentUser={currentUser}
                    proposalStreamID={proposalStreamID as string}
                >
                    <ProposalUI currentUser={currentUser} />
                </ProposalContextProvider>
            ) : (
                <></>
            )}
        </>
    )
}
