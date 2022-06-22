import ConnectWalletSection from '@cambrian/app/components/sections/ConnectWalletSection'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import ProfileDashboardUI from '@cambrian/app/ui/dashboard/ProfileDashboardUI'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'

export default function ProfileDashboardPage() {
    const { currentUser, isUserLoaded } = useCurrentUser()

    return (
        <>
            {isUserLoaded ? (
                currentUser && currentUser.selfID ? (
                    <ProfileDashboardUI
                        currentUser={currentUser}
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
