import API, { DocumentModel } from '../services/api/cambrian.api'
import React, { PropsWithChildren, useEffect, useState } from 'react'

import { CompositionModel } from '../models/CompositionModel'
import Template from '../classes/stages/Template'
import { TemplateModel } from '../models/TemplateModel'
import TemplateService from '../services/stages/TemplateService'
import { TokenAPI } from '../services/api/Token.api'
import { useCurrentUserContext } from '../hooks/useCurrentUserContext'

export type TemplateContextType = {
    template?: Template
    isLoaded: boolean
}

type TemplateProviderProps = PropsWithChildren<{}> & {
    templateDoc: DocumentModel<TemplateModel>
}

export const TemplateContext = React.createContext<TemplateContextType>({
    isLoaded: false,
})

export const TemplateContextProvider: React.FunctionComponent<TemplateProviderProps> =
    ({ templateDoc, children }) => {
        const { currentUser, isUserLoaded } = useCurrentUserContext()
        const [isLoaded, setIsLoaded] = useState(false)
        const [template, setTemplate] = useState<Template>()

        useEffect(() => {
            if (isUserLoaded) init()
        }, [isUserLoaded])

        const init = async () => {
            try {
                setIsLoaded(false)

                const templateService = new TemplateService()
                const templateConfig =
                    await templateService.fetchTemplateConfig(
                        templateDoc,
                        currentUser
                    )

                if (!templateConfig)
                    throw new Error(
                        'Read Commit Error: Failed to load Composition'
                    )
                const _template = new Template(
                    templateConfig,
                    templateService,
                    currentUser
                )
                setTemplate(_template)
                setIsLoaded(true)
            } catch (e) {
                console.error(e)
            }
        }

        return (
            <TemplateContext.Provider
                value={{
                    template: template,
                    isLoaded: isLoaded,
                }}
            >
                {children}
            </TemplateContext.Provider>
        )
    }
