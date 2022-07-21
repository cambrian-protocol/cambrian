import ConnectWalletSection from '@cambrian/app/components/sections/ConnectWalletSection'
import EditProposalUI from '@cambrian/app/ui/proposals/EditProposalUI'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import _ from 'lodash'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'

export default function EditProposalPage() {
    const { currentUser, isUserLoaded } = useCurrentUser()

    return (
        <>
            {isUserLoaded ? (
                currentUser ? (
                    <EditProposalUI />
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
