import CeramicStagehand, {
    StageNames,
} from '@cambrian/app/classes/CeramicStagehand'
import { useEffect, useState } from 'react'

import { Box } from 'grommet'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import ConnectWalletSection from '@cambrian/app/components/sections/ConnectWalletSection'
import Custom404Page from 'packages/app/pages/404'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import TemplateWizard from '@cambrian/app/ui/templates/wizard/TemplateWizard'
import _ from 'lodash'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useRouter } from 'next/router'

export default function NewTemplatePage() {
    const { currentUser, isUserLoaded } = useCurrentUser()
    const router = useRouter()
    const { templateStreamID } = router.query
    const [cachedTemplate, setCachedTemplate] = useState<CeramicTemplateModel>()
    const [templateInput, setTemplateInput] = useState<CeramicTemplateModel>()
    const [composition, setComposition] = useState<CompositionModel>()
    const [show404NotFound, setShow404NotFound] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [ceramicStagehand, setCeramicStagehand] = useState<CeramicStagehand>()

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
                    const cs = new CeramicStagehand(currentUser.selfID)
                    setCeramicStagehand(cs)
                    const template = (await (
                        await cs.loadStream(templateStreamID)
                    ).content) as CeramicTemplateModel

                    if (template) {
                        const comp = (await (
                            await cs.loadStream(template.composition.commitID)
                        ).content) as CompositionModel

                        if (comp) {
                            setComposition(comp)
                            setCachedTemplate(_.cloneDeep(template))
                            return setTemplateInput(template)
                        }
                    }
                } catch (e) {
                    setErrorMessage(await cpLogger.push(e))
                }
            }
            setShow404NotFound(true)
        }
    }

    const onSaveTemplate = async () => {
        if (templateInput && ceramicStagehand) {
            if (!_.isEqual(templateInput, cachedTemplate)) {
                const { uniqueTag } = await ceramicStagehand.updateStage(
                    templateStreamID as string,
                    templateInput,
                    StageNames.template
                )
                const templateWithUniqueTitle = {
                    ...templateInput,
                    title: uniqueTag,
                }
                setCachedTemplate(_.cloneDeep(templateWithUniqueTitle))
                setTemplateInput(templateWithUniqueTitle)
            }
        }
    }

    return (
        <>
            {isUserLoaded ? (
                currentUser ? (
                    show404NotFound ? (
                        <Custom404Page />
                    ) : templateInput && ceramicStagehand && composition ? (
                        <PageLayout contextTitle="New Template">
                            <Box align="center" pad="large">
                                <Box width={'xlarge'} gap="large">
                                    <TemplateWizard
                                        composition={composition}
                                        currentUser={currentUser}
                                        templateInput={templateInput}
                                        setTemplateInput={setTemplateInput}
                                        templateStreamID={
                                            templateStreamID as string
                                        }
                                        onSaveTemplate={onSaveTemplate}
                                    />
                                </Box>
                            </Box>
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
