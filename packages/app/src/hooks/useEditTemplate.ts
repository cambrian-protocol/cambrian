import {
    addRecentStage,
    loadCommitWorkaround,
    loadStageDoc,
} from './../services/ceramic/CeramicUtils'
import { updateStage } from '../services/ceramic/CeramicUtils'
import { useEffect, useState } from 'react'

import { CompositionModel } from '../models/CompositionModel'
import { ErrorMessageType } from '../constants/ErrorMessages'
import { StageNames } from '../models/StageModel'
import { TemplateModel } from '../models/TemplateModel'
import _ from 'lodash'
import { cpLogger } from '../services/api/Logger.api'
import { useCurrentUserContext } from './useCurrentUserContext'
import { useRouter } from 'next/router'

const useEditTemplate = () => {
    const { currentUser } = useCurrentUserContext()
    const router = useRouter()
    const { templateStreamID } = router.query
    const [cachedTemplate, setCachedTemplate] = useState<TemplateModel>()
    const [template, setTemplate] = useState<TemplateModel>()
    const [composition, setComposition] = useState<CompositionModel>()
    const [show404NotFound, setShow404NotFound] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    useEffect(() => {
        if (router.isReady && currentUser) fetchTemplate()
    }, [router, currentUser])

    const fetchTemplate = async () => {
        if (
            templateStreamID !== undefined &&
            typeof templateStreamID === 'string' &&
            currentUser
        ) {
            try {
                const templateDoc = await loadStageDoc<TemplateModel>(
                    currentUser,
                    templateStreamID
                )
                if (
                    templateDoc.content !== null &&
                    typeof templateDoc.content === 'object'
                ) {
                    // Just initialize edit paths if currentUser is the author
                    if (
                        (!router.pathname.includes('edit') &&
                            !router.pathname.includes('new')) ||
                        currentUser.did === templateDoc.content.author
                    ) {
                        await addRecentStage(currentUser, templateStreamID)

                        const _composition = <CompositionModel>(
                            (
                                await loadCommitWorkaround(
                                    templateDoc.content.composition.commitID
                                )
                            ).content
                        )

                        console.log(_composition)

                        if (_composition) {
                            setComposition(_composition)
                            setCachedTemplate(_.cloneDeep(templateDoc.content))
                            return setTemplate(templateDoc.content)
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
        if (template && currentUser) {
            if (!_.isEqual(template, cachedTemplate)) {
                try {
                    const title = await updateStage(
                        templateStreamID as string,
                        template,
                        StageNames.template,
                        currentUser
                    )
                    const templateWithUniqueTitle = {
                        ...template,
                        title: title,
                    }
                    setCachedTemplate(_.cloneDeep(templateWithUniqueTitle))
                    setTemplate(templateWithUniqueTitle)
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
        setTemplate(cachedTemplate)
    }

    return {
        template: template,
        setTemplate: setTemplate,
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
