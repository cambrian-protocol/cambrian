import CeramicStagehand, { StageNames } from '../classes/CeramicStagehand'
import { useEffect, useState } from 'react'

import { CeramicTemplateModel } from '../models/TemplateModel'
import { CompositionModel } from '../models/CompositionModel'
import { ErrorMessageType } from '../constants/ErrorMessages'
import _ from 'lodash'
import { cpLogger } from '../services/api/Logger.api'
import { useCurrentUserContext } from './useCurrentUserContext'
import { useRouter } from 'next/router'

const useEditTemplate = () => {
    const { currentUser } = useCurrentUserContext()
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
                    const cs = new CeramicStagehand(currentUser)
                    setCeramicStagehand(cs)
                    const template = (await (
                        await cs.loadTileDocument(templateStreamID)
                    ).content) as CeramicTemplateModel

                    if (template) {
                        // Just initialize edit paths if currentUser is the author
                        if (
                            (!router.pathname.includes('edit') &&
                                !router.pathname.includes('new')) ||
                            currentUser.did === template.author
                        ) {
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
                    }
                } catch (e) {
                    setErrorMessage(await cpLogger.push(e))
                }
            }
            setShow404NotFound(true)
        }
    }

    const onSaveTemplate = async (): Promise<boolean> => {
        if (templateInput && ceramicStagehand) {
            if (!_.isEqual(templateInput, cachedTemplate)) {
                try {
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
                    return true
                } catch (e) {
                    setErrorMessage(await cpLogger.push(e))
                }
            } else {
                return true
            }
        }
        return false
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
        templateStreamID: templateStreamID as string,
        cachedTemplate: cachedTemplate,
    }
}

export default useEditTemplate
