import React, { PropsWithChildren, useEffect, useState } from 'react'

import API from '../services/api/cambrian.api'
import Template from '../classes/stages/Template'
import { TemplateModel } from '../models/TemplateModel'
import TemplateService from '../services/stages/TemplateService'
import { useCurrentUserContext } from '../hooks/useCurrentUserContext'

export type TemplateContextType = {
    template?: Template
    isLoaded: boolean
}

type TemplateProviderProps = PropsWithChildren<{}> & {
    templateStreamID: string
}

export const TemplateContext = React.createContext<TemplateContextType>({
    isLoaded: false,
})

export const TemplateContextProvider: React.FunctionComponent<TemplateProviderProps> =
    ({ templateStreamID, children }) => {
        const { currentUser, isUserLoaded } = useCurrentUserContext()
        const [isLoaded, setIsLoaded] = useState(false)
        const [template, setTemplate] = useState<Template>()

        useEffect(() => {
            if (isUserLoaded) init()
        }, [templateStreamID, currentUser])

        const init = async () => {
            setIsLoaded(false)
            const templateService = new TemplateService()

            const templateStreamDoc = await API.doc.readStream<TemplateModel>(
                templateStreamID
            )

            if (templateStreamDoc) {
                const _template = new Template(
                    templateStreamDoc,
                    templateService,
                    currentUser
                )

                setTemplate(_template)
                setIsLoaded(true)
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
