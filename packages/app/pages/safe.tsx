import { Box } from 'grommet'
import DashboardHeader from '@cambrian/app/components/layout/header/DashboardHeader'
import FindSolverWidget from '@cambrian/app/ui/dashboard/widgets/FindSolverWidget'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import RedeemableTokenListWidget from '@cambrian/app/ui/dashboard/widgets/RedeemableTokenListWidget'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

export default function Safe() {
    const { currentUser, isUserLoaded } = useCurrentUserContext()

    return (
        <>
            {isUserLoaded && currentUser ? (
                <PageLayout kind="narrow">
                    <Box pad="large" gap="medium">
                        <DashboardHeader
                            title="Redeemable funds"
                            description="Redeem Solver funds sent to a Gnosis Safe"
                        />
                        <RedeemableTokenListWidget currentUser={currentUser} />
                        <FindSolverWidget currentUser={currentUser} />
                    </Box>
                </PageLayout>
            ) : (
                <LoadingScreen context="Connecting Wallet" />
            )}
        </>
    )
}
