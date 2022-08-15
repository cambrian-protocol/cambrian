import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import TemplatesDashboardUI from '@cambrian/app/ui/dashboard/TemplatesDashboardUI'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

export default function TemplatesDashboardPage() {
    const { currentUser } = useCurrentUserContext()

    return (
        <>
            {currentUser ? (
                <TemplatesDashboardUI currentUser={currentUser} />
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['WALLET']} />
            )}
        </>
    )
}
