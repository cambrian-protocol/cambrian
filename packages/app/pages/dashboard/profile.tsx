import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import ProfileDashboardUI from '@cambrian/app/ui/dashboard/ProfileDashboardUI'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

export default function ProfileDashboardPage() {
    const { currentUser } = useCurrentUserContext()

    return (
        <>
            {currentUser ? (
                <ProfileDashboardUI currentUser={currentUser} />
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['WALLET']} />
            )}
        </>
    )
}
