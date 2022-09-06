import CompositionsDashboardUI from '@cambrian/app/ui/dashboard/CompositionsDashboardUI'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

export default function CompositionsDashboardPage() {
    const { currentUser } = useCurrentUserContext()

    return (
        <>
            {currentUser ? (
                <CompositionsDashboardUI currentUser={currentUser} />
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['WALLET']} />
            )}
        </>
    )
}
