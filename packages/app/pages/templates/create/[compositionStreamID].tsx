import { useEffect, useState } from 'react'

import { Box } from 'grommet'
import CeramicStagehand from '@cambrian/app/classes/CeramicStagehand'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import ConnectWalletSection from '@cambrian/app/components/sections/ConnectWalletSection'
import CreateTemplateUI from '@cambrian/app/ui/templates/CreateTemplateUI'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import InvalidQueryComponent from '@cambrian/app/components/errors/InvalidQueryComponent'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import { StageNames } from '@cambrian/app/classes/Stagehand'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useRouter } from 'next/dist/client/router'

export default function CreateTemplatePage() {
    const { currentUser, isUserLoaded } = useCurrentUser()
    const router = useRouter()
    const { compositionStreamID } = router.query
    const [currentComposition, setCurrentComposition] =
        useState<CompositionModel>()
    const [showInvalidQueryComponent, setShowInvalidQueryComponent] =
        useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    useEffect(() => {
        if (router.isReady) fetchComposition()
    }, [router, currentUser])

    const fetchComposition = async () => {
        if (
            compositionStreamID !== undefined &&
            typeof compositionStreamID === 'string' &&
            currentUser &&
            currentUser.selfID
        ) {
            try {
                const ceramicStagehand = new CeramicStagehand(
                    currentUser.selfID
                )
                const composition = (await ceramicStagehand.loadStream(
                    compositionStreamID
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
            {isUserLoaded ? (
                currentUser ? (
                    currentComposition ? (
                        <PageLayout contextTitle="Create Template">
                            <Box alignSelf="center">
                                <CreateTemplateUI
                                    currentUser={currentUser}
                                    composition={currentComposition}
                                    compositionCID={
                                        compositionStreamID as string
                                    }
                                    setErrorMessage={setErrorMessage}
                                />
                            </Box>
                        </PageLayout>
                    ) : showInvalidQueryComponent ? (
                        <PageLayout contextTitle="Create Template">
                            <InvalidQueryComponent
                                context={StageNames.composition}
                            />
                        </PageLayout>
                    ) : (
                        <LoadingScreen
                            context={LOADING_MESSAGE['COMPOSITION']}
                        />
                    )
                ) : (
                    <PageLayout contextTitle="Connect your Wallet">
                        <ConnectWalletSection />
                    </PageLayout>
                )
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['WALLET']} />
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
