import CeramicStagehand, { StageNames } from '../classes/CeramicStagehand'
import { useEffect, useState } from 'react'

import { CeramicTemplateModel } from '../models/TemplateModel'
import { CompositionModel } from '../models/CompositionModel'
import { ErrorMessageType } from '../constants/ErrorMessages'
import _ from 'lodash'
import { cpLogger } from './../services/api/Logger.api'
import { useCurrentUser } from './useCurrentUser'
import { useRouter } from 'next/router'

const useTemplate = () => {
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
                        await cs.loadTileDocument(templateStreamID)
                    ).content) as CeramicTemplateModel

                    if (template) {
                        const comp = (await (
                            await cs.loadTileDocument(
                                template.composition.commitID
                            )
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

    const onResetTemplate = () => {
        setTemplateInput(cachedTemplate)
    }

    return {
        templateInput: templateInput,
        setTemplateInput: setTemplateInput,
        composition: composition,
        show404NotFound: show404NotFound,
        errorMessage: errorMessage,
        setErrorMessage: setErrorMessage,
        onSaveTemplate: onSaveTemplate,
        onResetTemplate: onResetTemplate,
        currentUser: currentUser,
        isUserLoaded: isUserLoaded,
        templateStreamID: templateStreamID as string,
        cachedTemplate: cachedTemplate,
    }
}

export default useTemplate
