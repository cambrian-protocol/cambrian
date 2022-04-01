import Stagehand, { StageNames } from '@cambrian/app/classes/Stagehand'
import { useEffect, useState } from 'react'

import { BaseLayout } from '@cambrian/app/components/layout/BaseLayout'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import CreateTemplateUI from '@cambrian/app/ui/templates/CreateTemplateUI'
import InvalidCIDUI from '@cambrian/app/ui/general/InvalidCIDUI'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import { useRouter } from 'next/dist/client/router'

export default function CreateTemplatePage() {
    const router = useRouter()
    const { compositionCID } = router.query
    const [currentComposition, setCurrentComposition] =
        useState<CompositionModel>()
    const [showError, setShowError] = useState(false)

    useEffect(() => {
        if (router.isReady) fetchComposition()
    }, [router])

    const fetchComposition = async () => {
        if (
            compositionCID !== undefined &&
            typeof compositionCID === 'string'
        ) {
            const stagehand = new Stagehand()
            const composition = (await stagehand.loadStage(
                compositionCID,
                StageNames.composition
            )) as CompositionModel

            if (composition) return setCurrentComposition(composition)
        }
        setShowError(true)
    }

    return (
        <BaseLayout contextTitle="Create Template">
            {currentComposition ? (
                <CreateTemplateUI
                    composition={currentComposition}
                    compositionCID={compositionCID as string}
                />
            ) : showError ? (
                <InvalidCIDUI stageName={StageNames.composition} />
            ) : (
                <LoadingScreen context="Loading composition" />
            )}
        </BaseLayout>
    )
}
