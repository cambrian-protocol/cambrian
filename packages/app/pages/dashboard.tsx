import ConnectWalletSection from '@cambrian/app/components/sections/ConnectWalletSection'
import DashboardUI from '@cambrian/app/ui/dashboard/DashboardUI'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'

export default function DashboardPage() {
    const { currentUser, isUserLoaded } = useCurrentUser()

    return (
        <>
            {isUserLoaded ? (
                currentUser && currentUser.selfID ? (
                    <DashboardUI
                        walletAddress={currentUser.address}
                        selfID={currentUser.selfID}
                    />
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
