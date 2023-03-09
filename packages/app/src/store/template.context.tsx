import React, { PropsWithChildren, useEffect, useState } from 'react'

import { DocumentModel } from '../services/api/cambrian.api'
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
        const { currentUser } = useCurrentUserContext()
        const [isLoaded, setIsLoaded] = useState(false)
        const [template, setTemplate] = useState<Template>()

        useEffect(() => {
            if (currentUser) init()
        }, [currentUser])

        const init = async () => {
            setIsLoaded(false)
            const denominationToken = await TokenAPI.getTokenInfo(
                templateDoc.content.price.denominationTokenAddress
            )
            const templateService = new TemplateService()
            const _template = new Template(
                templateDoc,
                denominationToken,
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
