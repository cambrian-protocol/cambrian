import Stagehand, { StageNames } from '@cambrian/app/classes/Stagehand'
import { useEffect, useState } from 'react'

import { AppbarItem } from '@cambrian/app/components/nav/AppbarItem'
import { BaseLayout } from '@cambrian/app/components/layout/BaseLayout'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import CreateTemplateUI from '@cambrian/app/ui/templates/CreateTemplateUI'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import { FolderOpen } from 'phosphor-react'
import InvalidQueryComponent from '@cambrian/app/components/errors/InvalidQueryComponent'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import RecentExportsModal from '@cambrian/app/components/modals/RecentExportsModal'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useRouter } from 'next/dist/client/router'

export default function CreateTemplatePage() {
    const router = useRouter()
    const { compositionCID } = router.query
    const [currentComposition, setCurrentComposition] =
        useState<CompositionModel>()
    const [showInvalidQueryComponent, setShowInvalidQueryComponent] =
        useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [showRecentTemplatesModal, setShowRecentTemplatesModal] =
        useState(false)

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
            try {
                const stagehand = new Stagehand()
                const composition = (await stagehand.loadStage(
                    compositionCID,
                    StageNames.composition
                )) as CompositionModel

                if (composition) return setCurrentComposition(composition)
            } catch (e) {
                setErrorMessage(await cpLogger.push(e))
            }
        }
        setShowInvalidQueryComponent(true)
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
                ]}
            >
                {currentComposition ? (
                    <CreateTemplateUI
                        composition={currentComposition}
                        compositionCID={compositionCID as string}
                        setErrorMessage={setErrorMessage}
                    />
                ) : showInvalidQueryComponent ? (
                    <InvalidQueryComponent context={StageNames.composition} />
                ) : (
                    <LoadingScreen context={LOADING_MESSAGE['COMPOSITION']} />
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
            {errorMessage && (
                <ErrorPopupModal
                    onClose={() => setErrorMessage(undefined)}
                    errorMessage={errorMessage}
                />
            )}
        </>
    )
}
