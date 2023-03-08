import API, { DocumentModel } from '../services/api/cambrian.api'
import React, { PropsWithChildren, useEffect, useState } from 'react'

import Template from '../classes/stages/Template'
import { TemplateModel } from '../models/TemplateModel'
import TemplateService from '../services/stages/TemplateService'
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
        const { currentUser } = useCurrentUserContext()
        const [isLoaded, setIsLoaded] = useState(false)
        const [template, setTemplate] = useState<Template>()

        useEffect(() => {
            if (currentUser) init()
        }, [currentUser])

        const init = async () => {
            setIsLoaded(false)
            const templateService = new TemplateService()
            const _template = new Template(
                templateDoc,
                templateService,
                currentUser
            )
            setTemplate(_template)
            setIsLoaded(true)
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
