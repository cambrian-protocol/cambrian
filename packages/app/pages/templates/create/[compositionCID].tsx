import { FolderOpen, TreeStructure } from 'phosphor-react'
import Stagehand, { StageNames } from '@cambrian/app/classes/Stagehand'
import { useEffect, useState } from 'react'

import { AppbarItem } from '@cambrian/app/components/nav/AppbarItem'
import { BaseLayout } from '@cambrian/app/components/layout/BaseLayout'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import CreateTemplateUI from '@cambrian/app/ui/templates/CreateTemplateUI'
import InvalidCIDUI from '@cambrian/app/ui/general/InvalidCIDUI'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import RecentExportsModal from '@cambrian/app/components/modals/RecentExportsModal'
import SolutionPreviewModal from '@cambrian/app/components/modals/SolutionPreviewModal'
import { useRouter } from 'next/dist/client/router'

export default function CreateTemplatePage() {
    const router = useRouter()
    const { compositionCID } = router.query
    const [currentComposition, setCurrentComposition] =
        useState<CompositionModel>()
    const [showError, setShowError] = useState(false)
    const [showRecentTemplatesModal, setShowRecentTemplatesModal] =
        useState(false)
    const [showSolutionPreviewModal, setShowSolutionPreviewModal] =
        useState(false)

    const toggleShowSolutionPreviewModal = () =>
        setShowSolutionPreviewModal(!showSolutionPreviewModal)

    const toggleShowRecentTemplatesModal = () =>
        setShowRecentTemplatesModal(!showRecentTemplatesModal)

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
        <>
            <BaseLayout
                contextTitle="Create Template"
                appbarItems={[
                    <AppbarItem
                        icon={<FolderOpen />}
                        onClick={toggleShowRecentTemplatesModal}
                    />,
                    <AppbarItem
                        icon={<TreeStructure />}
                        onClick={toggleShowSolutionPreviewModal}
                    />,
                ]}
            >
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
            {showRecentTemplatesModal && (
                <RecentExportsModal
                    prefix="templates"
                    route="/templates/"
                    keyCID={compositionCID as string}
                    title="Recent templates"
                    subTitle="Distribute on of your"
                    paragraph="Warning: These template CIDs are just stored in your local storage. They will be lost if you clear the cache of your browser."
                    onClose={toggleShowRecentTemplatesModal}
                />
            )}
            {showSolutionPreviewModal && currentComposition && (
                <SolutionPreviewModal
                    onBack={toggleShowSolutionPreviewModal}
                    composition={currentComposition}
                />
            )}
        </>
    )
}
