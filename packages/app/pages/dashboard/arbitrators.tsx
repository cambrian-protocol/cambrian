import ArbitratorsDashboardUI from '@cambrian/app/ui/dashboard/ArbitratorsDashboardUI'
import ConnectWalletSection from '@cambrian/app/components/sections/ConnectWalletSection'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

export default function ArbitratorsDashboardPage() {
    const { currentUser, isUserLoaded } = useCurrentUserContext()

    return (
        <>
            {isUserLoaded ? (
                currentUser && currentUser.selfID ? (
                    <ArbitratorsDashboardUI currentUser={currentUser} />
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
