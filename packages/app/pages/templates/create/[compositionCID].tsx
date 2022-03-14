import Stagehand, { StageNames } from '@cambrian/app/classes/Stagehand'
import { useEffect, useState } from 'react'

import { BaseLayout } from '@cambrian/app/components/layout/BaseLayout'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import CreateTemplateUI from '@cambrian/app/ui/templates/CreateTemplateUI'
import InvalidCIDUI from '@cambrian/app/ui/general/InvalidCIDUI'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import { parseComposerSolvers } from '@cambrian/app/utils/transformers/ComposerTransformer'
import { useRouter } from 'next/dist/client/router'

const createTemplatePageTitle = 'Create Template'

export default function CreateTemplatePage() {
    const router = useRouter()
    const { compositionCID } = router.query
    const [currentComposition, setCurrentComposition] =
        useState<CompositionModel>()
    const [currentCompositionCID, setCurrentCompositionCID] = useState<string>()
    const [isLoading, setIsLoading] = useState(true)
    const [showError, setShowError] = useState(false)
    const [stagehand] = useState(new Stagehand())

    useEffect(() => {
        if (!router.isReady) return
        if (
            compositionCID !== undefined &&
            typeof compositionCID === 'string'
        ) {
            setCurrentCompositionCID(compositionCID)
            fetchComposition(compositionCID)
        } else {
            setShowError(true)
        }
    }, [router])

    const fetchComposition = async (compositionCID: string) => {
        setIsLoading(true)
        try {
            const composition = (await stagehand.loadStage(
                compositionCID,
                StageNames.composition
            )) as CompositionModel

            // Check if composition is valid
            const parsedSolvers = await parseComposerSolvers(
                composition.solvers
            )

            if (composition && parsedSolvers) {
                setCurrentComposition(composition)
            } else {
                setShowError(true)
            }
        } catch {
            setShowError(true)
            console.warn('Cannot parse and load composition')
        }
        setIsLoading(false)
    }

    return (
        <>
            {currentComposition && currentCompositionCID && (
                <BaseLayout contextTitle={createTemplatePageTitle}>
                    <CreateTemplateUI
                        stagehand={stagehand}
                        compositionCID={currentCompositionCID}
                        composition={currentComposition}
                    />
                </BaseLayout>
            )}
            {showError && (
                <InvalidCIDUI
                    contextTitle={createTemplatePageTitle}
                    stageName={StageNames.composition}
                />
            )}
            {isLoading && <LoadingScreen context="Loading composition" />}
        </>
    )
}
