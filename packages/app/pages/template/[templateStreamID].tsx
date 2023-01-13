import { useEffect, useState } from 'react'

import Custom404Page from '../404'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import { StageNames } from '@cambrian/app/models/StageModel'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import TemplateUI from '@cambrian/app/ui/templates/TemplateUI'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '@cambrian/app/store/UserContext'
import { fetchStageTileDoc } from '@cambrian/app/utils/helpers/stageHelper'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useRouter } from 'next/router'

export default function ViewTemplatePage() {
    const router = useRouter()
    const { templateStreamID } = router.query
    const { currentUser } = useCurrentUserContext()
    const [templateStreamDoc, setTemplateStreamDoc] =
        useState<TileDocument<TemplateModel>>()
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        if (router.isReady && currentUser) fetchTemplate(currentUser)
    }, [router, currentUser])

    const fetchTemplate = async (currentUser: UserType) => {
        try {
            setTemplateStreamDoc(
                (await fetchStageTileDoc(
                    currentUser,
                    templateStreamID as string,
                    StageNames.template
                )) as TileDocument<TemplateModel>
            )
        } catch (e) {
            console.error(e)
        }
        setIsLoaded(true)
    }

    return (
        <>
            {isLoaded ? (
                templateStreamDoc ? (
                    <TemplateUI templateStreamDoc={templateStreamDoc} />
                ) : (
                    <Custom404Page />
                )
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['TEMPLATE']} />
            )}
        </>
    )
}
