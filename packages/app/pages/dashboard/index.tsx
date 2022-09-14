import DashboardUI from '@cambrian/app/ui/dashboard/DashboardUI'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

export default function DashboardPage() {
    const { currentUser } = useCurrentUserContext()

    return (
        <>
            {currentUser ? (
                <DashboardUI currentUser={currentUser} />
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['WALLET']} />
            )}
        </>
    )
}
