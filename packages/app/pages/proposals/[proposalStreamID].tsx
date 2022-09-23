import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import { ProposalContextProvider } from '@cambrian/app/store/ProposalContext'
import ProposalUI from '@cambrian/app/ui/proposals/ProposalUI'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useRouter } from 'next/router'

export default function ViewProposalPage() {
    const { currentUser } = useCurrentUserContext()
    const router = useRouter()
    const { proposalStreamID } = router.query

    return (
        <>
            {currentUser ? (
                <ProposalContextProvider
                    currentUser={currentUser}
                    proposalStreamID={proposalStreamID as string}
                >
                    <ProposalUI currentUser={currentUser} />
                </ProposalContextProvider>
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['PROPOSAL']} />
            )}
        </>
    )
}
