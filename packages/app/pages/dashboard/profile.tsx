import ConnectWalletSection from '@cambrian/app/components/sections/ConnectWalletSection'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import ProfileDashboardUI from '@cambrian/app/ui/dashboard/ProfileDashboardUI'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

export default function ProfileDashboardPage() {
    const { currentUser, isUserLoaded } = useCurrentUserContext()

    return (
        <>
            {isUserLoaded ? (
                currentUser ? (
                    <ProfileDashboardUI currentUser={currentUser} />
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
