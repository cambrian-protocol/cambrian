import { addRecentStage } from './../services/ceramic/CeramicUtils'
import { useEffect, useState } from 'react'

import { CeramicTemplateModel } from '../models/TemplateModel'
import { CompositionModel } from '../models/CompositionModel'
import { ErrorMessageType } from '../constants/ErrorMessages'
import _ from 'lodash'
import { cpLogger } from '../services/api/Logger.api'
import { useCurrentUserContext } from './useCurrentUserContext'
import { useRouter } from 'next/router'
import CeramicTemplateAPI from '../services/ceramic/CeramicTemplateAPI'
import { ceramicInstance, updateStage } from '../services/ceramic/CeramicUtils'
import { StageNames } from '../models/StageModel'

const useEditTemplate = () => {
    const { currentUser } = useCurrentUserContext()
    const router = useRouter()
    const [ceramicTemplateAPI, setCeramicTemplateAPI] =
        useState<CeramicTemplateAPI>()
    const { templateStreamID } = router.query
    const [cachedTemplate, setCachedTemplate] = useState<CeramicTemplateModel>()
    const [templateInput, setTemplateInput] = useState<CeramicTemplateModel>()
    const [composition, setComposition] = useState<CompositionModel>()
    const [show404NotFound, setShow404NotFound] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    useEffect(() => {
        initCeramic()
    }, [currentUser])

    useEffect(() => {
        if (router.isReady && ceramicTemplateAPI)
            fetchTemplate(ceramicTemplateAPI)
    }, [router, ceramicTemplateAPI])

    const initCeramic = () => {
        if (currentUser) {
            setCeramicTemplateAPI(new CeramicTemplateAPI(currentUser))
        }
    }

    const fetchTemplate = async (ceramicTemplateAPI: CeramicTemplateAPI) => {
        if (
            templateStreamID !== undefined &&
            typeof templateStreamID === 'string' &&
            currentUser
        ) {
            try {
                const template = await ceramicTemplateAPI.loadTemplateDoc(
                    templateStreamID
                )
                if (
                    template.content !== null &&
                    typeof template.content === 'object'
                ) {
                    // Just initialize edit paths if currentUser is the author
                    if (
                        (!router.pathname.includes('edit') &&
                            !router.pathname.includes('new')) ||
                        currentUser.did === template.content.author
                    ) {
                        await addRecentStage(
                            currentUser,
                            StageNames.template,
                            templateStreamID
                        )

                        const _composition = <CompositionModel>(
                            (
                                await ceramicInstance(currentUser).loadStream(
                                    template.content.composition.commitID
                                )
                            ).content
                        )

                        if (_composition) {
                            setComposition(_composition)
                            setCachedTemplate(_.cloneDeep(template.content))
                            return setTemplateInput(template.content)
                        }
                    }
                }
            } catch (e) {
                setErrorMessage(await cpLogger.push(e))
            }
        }
        setShow404NotFound(true)
    }

    const onSaveTemplate = async (): Promise<boolean> => {
        if (templateInput && currentUser) {
            if (!_.isEqual(templateInput, cachedTemplate)) {
                try {
                    const title = await updateStage(
                        templateStreamID as string,
                        templateInput,
                        StageNames.template,
                        currentUser
                    )
                    const templateWithUniqueTitle = {
                        ...templateInput,
                        title: title,
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
