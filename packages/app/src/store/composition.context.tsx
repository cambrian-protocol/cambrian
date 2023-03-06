import React, { PropsWithChildren, useEffect, useState } from 'react'

import API from '../services/api/cambrian.api'
import Composition from '../classes/stages/Composition'
import { CompositionModel } from '../models/CompositionModel'
import CompositionService from '../services/stages/CompositionService'
import { useCurrentUserContext } from '../hooks/useCurrentUserContext'

export type CompositionContextType = {
    composition?: Composition
    isLoaded: boolean
}

type CompositionProviderProps = PropsWithChildren<{}> & {
    compositionStreamID: string
}

export const CompositionContext = React.createContext<CompositionContextType>({
    isLoaded: false,
})

export const CompositionContextProvider: React.FunctionComponent<CompositionProviderProps> =
    ({ compositionStreamID, children }) => {
        const { currentUser, isUserLoaded } = useCurrentUserContext()
        const [isLoaded, setIsLoaded] = useState(false)
        const [composition, setComposition] = useState<Composition>()

        useEffect(() => {
            if (isUserLoaded) init()
        }, [compositionStreamID, currentUser])

        const init = async () => {
            setIsLoaded(false)

            const compositionStreamDoc =
                await API.doc.readStream<CompositionModel>(compositionStreamID)

            if (compositionStreamDoc) {
                const compositionService = new CompositionService()
                const _composition = new Composition(
                    compositionStreamDoc,
                    compositionService,
                    currentUser
                )

                setComposition(_composition)
                setIsLoaded(true)
            }
        }

        return (
            <CompositionContext.Provider
                value={{
                    composition: composition,
                    isLoaded: isLoaded,
                }}
            >
                {children}
            </CompositionContext.Provider>
        )
    }
