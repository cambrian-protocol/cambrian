import ConnectWalletSection from '@cambrian/app/components/sections/ConnectWalletSection'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import NewProposalUI from '@cambrian/app/ui/proposals/NewProposalUI'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import { ProposalContextProvider } from '@cambrian/app/store/ProposalContext'
import _ from 'lodash'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useRouter } from 'next/router'

export default function NewProposalPage() {
    const { currentUser, isUserLoaded } = useCurrentUser()
    const router = useRouter()
    const { proposalStreamID } = router.query

    return (
        <>
            {isUserLoaded ? (
                currentUser ? (
                    <ProposalContextProvider
                        proposalStreamID={proposalStreamID as string}
                    >
                        <NewProposalUI />
                    </ProposalContextProvider>
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
