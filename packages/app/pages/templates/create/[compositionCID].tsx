import Stagehand, { StageNames } from '@cambrian/app/classes/Stagehand'
import CeramicStagehand from '@cambrian/app/classes/CeramicStagehand'

import { useEffect, useState } from 'react'

import { Box } from 'grommet'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import CreateTemplateUI from '@cambrian/app/ui/templates/CreateTemplateUI'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import InvalidQueryComponent from '@cambrian/app/components/errors/InvalidQueryComponent'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useRouter } from 'next/dist/client/router'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'

export default function CreateTemplatePage() {
    const currentUser = useCurrentUser().currentUser
    const router = useRouter()
    const { compositionCID } = router.query
    const [currentComposition, setCurrentComposition] =
        useState<CompositionModel>()
    const [showInvalidQueryComponent, setShowInvalidQueryComponent] =
        useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    useEffect(() => {
        if (router.isReady) fetchComposition()
    }, [router])

    const fetchComposition = async () => {
        if (
            compositionCID !== undefined &&
            typeof compositionCID === 'string'
        ) {
            try {
                const ceramicStagehand = new CeramicStagehand()
                const composition = (await ceramicStagehand.loadComposition(
                    compositionCID,
                    currentUser
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
            {currentComposition ? (
                <PageLayout contextTitle="Create Template">
                    <Box alignSelf="center">
                        <CreateTemplateUI
                            composition={currentComposition}
                            compositionCID={compositionCID as string}
                            setErrorMessage={setErrorMessage}
                        />
                    </Box>
                </PageLayout>
            ) : showInvalidQueryComponent ? (
                <PageLayout contextTitle="Create Template">
                    <InvalidQueryComponent context={StageNames.composition} />
                </PageLayout>
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['COMPOSITION']} />
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
