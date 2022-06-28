import { Box } from 'grommet'
import ConnectWalletSection from '@cambrian/app/components/sections/ConnectWalletSection'
import EditTemplateUI from '@cambrian/app/ui/templates/EditTemplateUI'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'

export default function EditTemplatePage() {
    const { currentUser, isUserLoaded } = useCurrentUser()

    return (
        <>
            {isUserLoaded ? (
                currentUser ? (
                    <PageLayout contextTitle="Edit Template">
                        <Box fill height={{ min: '90vh' }} pad="large">
                            <EditTemplateUI currentUser={currentUser} />
                        </Box>
                    </PageLayout>
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
