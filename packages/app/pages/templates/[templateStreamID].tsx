import { useEffect, useState } from 'react'

import { Box } from 'grommet'
import CeramicStagehand from '@cambrian/app/classes/CeramicStagehand'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import ConnectWalletSection from '@cambrian/app/components/sections/ConnectWalletSection'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import InvalidQueryComponent from '@cambrian/app/components/errors/InvalidQueryComponent'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import { StageNames } from '@cambrian/app/classes/Stagehand'
import ViewTemplateUI from '@cambrian/app/ui/templates/ViewTemplateUI'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useRouter } from 'next/router'

export default function ViewTemplatePage() {
    const { currentUser, isUserLoaded } = useCurrentUser()
    const router = useRouter()
    const { templateStreamID } = router.query
    const [currentTemplate, setCurrentTemplate] =
        useState<CeramicTemplateModel>()
    const [showInvalidQueryComponent, setShowInvalidQueryComponent] =
        useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    useEffect(() => {
        if (router.isReady) fetchTemplate()
    }, [router, currentUser])

    const fetchTemplate = async () => {
        if (currentUser) {
            if (
                templateStreamID !== undefined &&
                typeof templateStreamID === 'string'
            ) {
                try {
                    const ceramicStagehand = new CeramicStagehand(
                        currentUser.selfID
                    )
                    const template = (
                        await ceramicStagehand.loadStream(templateStreamID)
                    ).content as CeramicTemplateModel

                    if (template) return setCurrentTemplate(template)
                } catch (e) {
                    setErrorMessage(await cpLogger.push(e))
                }
            }
            setShowInvalidQueryComponent(true)
        }
    }

    return (
        <>
            {isUserLoaded ? (
                currentUser ? (
                    currentTemplate ? (
                        <PageLayout contextTitle={currentTemplate.title}>
                            <ViewTemplateUI template={currentTemplate} currentUser={currentUser}/>
                        </PageLayout>
                    ) : showInvalidQueryComponent ? (
                        <PageLayout contextTitle="Invalid Composition">
                            <InvalidQueryComponent
                                context={StageNames.template}
                            />
                        </PageLayout>
                    ) : (
                        <LoadingScreen context={LOADING_MESSAGE['TEMPLATE']} />
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
