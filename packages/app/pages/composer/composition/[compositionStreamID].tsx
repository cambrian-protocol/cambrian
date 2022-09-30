import { useEffect, useState } from 'react'

import { ComposerContextProvider } from '@cambrian/app/src/store/composer/composer.context'
import { ComposerUI } from '@cambrian/app/ui/composer/ComposerUI'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import Custom404Page from '../../404'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import { StageNames } from '@cambrian/app/models/StageModel'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '@cambrian/app/store/UserContext'
import { fetchStageTileDoc } from '@cambrian/app/utils/helpers/stageHelper'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useRouter } from 'next/router'

export default function ComposerPage() {
    const router = useRouter()
    const { compositionStreamID } = router.query
    const { currentUser } = useCurrentUserContext()
    const [compositionStreamDoc, setCompositionStreamDoc] =
        useState<TileDocument<CompositionModel>>()
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        if (router.isReady && currentUser) fetchComposition(currentUser)
    }, [router, currentUser])

    const fetchComposition = async (currentUser: UserType) => {
        try {
            setCompositionStreamDoc(
                (await fetchStageTileDoc(
                    currentUser,
                    compositionStreamID as string,
                    StageNames.composition
                )) as TileDocument<CompositionModel>
            )
        } catch (e) {
            console.error(e)
        }
        setIsLoaded(true)
    }

    return (
        <>
            {isLoaded ? (
                compositionStreamDoc && currentUser ? (
                    <ComposerContextProvider>
                        <ComposerUI
                            currentUser={currentUser}
                            compositionStreamDoc={compositionStreamDoc}
                        />
                    </ComposerContextProvider>
                ) : (
                    <Custom404Page />
                )
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['COMPOSITION']} />
            )}
        </>
    )
}
