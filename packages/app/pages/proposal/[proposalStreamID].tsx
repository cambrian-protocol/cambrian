import { useEffect, useState } from 'react'

import Custom404Page from '../404'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import { ProposalContextProvider } from '@cambrian/app/store/ProposalContext'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import ProposalUI from '@cambrian/app/ui/proposals/ProposalUI'
import { StageNames } from '@cambrian/app/models/StageModel'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '@cambrian/app/store/UserContext'
import { fetchStageTileDoc } from '@cambrian/app/utils/helpers/stageHelper'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useRouter } from 'next/router'

export default function ViewProposalPage() {
    const router = useRouter()
    const { proposalStreamID } = router.query
    const { currentUser } = useCurrentUserContext()
    const [proposalStreamDoc, setProposalStreamDoc] =
        useState<TileDocument<ProposalModel>>()
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        if (router.isReady && currentUser) fetchProposal(currentUser)
    }, [router, currentUser])

    const fetchProposal = async (currentUser: UserType) => {
        try {
            setProposalStreamDoc(
                (await fetchStageTileDoc(
                    currentUser,
                    proposalStreamID as string,
                    StageNames.proposal
                )) as TileDocument<ProposalModel>
            )
        } catch (e) {
            console.error(e)
        }
        setIsLoaded(true)
    }

    return (
        <>
            {isLoaded ? (
                proposalStreamDoc && currentUser ? (
                    <ProposalContextProvider
                        currentUser={currentUser}
                        proposalStreamDoc={proposalStreamDoc}
                    >
                        <ProposalUI currentUser={currentUser} />
                    </ProposalContextProvider>
                ) : (
                    <Custom404Page />
                )
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['PROPOSAL']} />
            )}
        </>
    )
}
