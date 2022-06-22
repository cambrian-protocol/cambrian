import ConnectWalletSection from '@cambrian/app/components/sections/ConnectWalletSection'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import ProposalsDashboardUI from '@cambrian/app/ui/dashboard/ProposalDashboardUI'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'

export default function ProposalsDashboardPage() {
    const { currentUser, isUserLoaded } = useCurrentUser()

    return (
        <>
            {isUserLoaded ? (
                currentUser && currentUser.selfID ? (
                    <ProposalsDashboardUI />
                ) : (
                    <PageLayout contextTitle="Connect your Wallet">
                        <ConnectWalletSection />
                    </PageLayout>
                )
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['WALLET']} />
            )}
        </>
    )
}
