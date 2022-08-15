import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import ProposalsDashboardUI from '@cambrian/app/ui/dashboard/ProposalsDashboardUI'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

export default function ProposalsDashboardPage() {
    const { currentUser } = useCurrentUserContext()

    return (
        <>
            {currentUser ? (
                <ProposalsDashboardUI currentUser={currentUser} />
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['WALLET']} />
            )}
        </>
    )
}
