import React, {
    PropsWithChildren,
    useEffect,
    useReducer,
    useState,
} from 'react'

import { ComposerAction } from './composer.types'
import { ComposerIdPathType } from '@cambrian/app/models/SolverModel'
import { ComposerOutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import ComposerSolver from '@cambrian/app/classes/ComposerSolver'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { composerReducer } from './composer.reducer'
import initialComposer from './composer.init'
import { ulid } from 'ulid'

type ComposerContextOptions = {
    composer: CompositionModel
    dispatch: React.Dispatch<ComposerAction>
    currentIdPath?: ComposerIdPathType
    currentSolver?: ComposerSolver
    currentOutcomeCollection?: ComposerOutcomeCollectionModel
}

const ComposerContext = React.createContext<ComposerContextOptions>({
    composer: {
        id: ulid(),
        title: '',
        description: '',
        flowElements: [],
        solvers: [],
    },
    dispatch: () => {},
})

const ComposerContextProvider = (props: PropsWithChildren<{}>) => {
    const [composer, dispatch] = useReducer(composerReducer, initialComposer)

    const [currentIdPath, setCurrentIdPath] = useState<ComposerIdPathType>()
    const [currentSolver, setCurrentSolver] = useState<ComposerSolver>()
    const [currentOutcomeCollection, setCurrentOutcomeCollection] =
        useState<ComposerOutcomeCollectionModel>()

    useEffect(() => {
        // Keeps track which Solver and OutcomeSelection is selected
        if (
            composer.currentIdPath !== undefined &&
            composer.currentIdPath.solverId !== undefined &&
            composer.currentIdPath.solverId.length
        ) {
            const currentSolver = composer.solvers.find(
                (x: ComposerSolver) => x.id === composer.currentIdPath?.solverId
            )
            setCurrentSolver(currentSolver)

            if (
                composer.currentIdPath.ocId !== undefined &&
                composer.currentIdPath.ocId.length
            ) {
                setCurrentOutcomeCollection(
                    currentSolver?.config.condition.partition.find(
                        (oc: ComposerOutcomeCollectionModel) =>
                            oc.id === composer.currentIdPath?.ocId
                    )
                )
            } else {
                setCurrentOutcomeCollection(undefined)
            }
        } else {
            setCurrentSolver(undefined)
        }
        setCurrentIdPath(composer.currentIdPath)
    }, [composer.currentIdPath])

    return (
        <ComposerContext.Provider
            value={{
                composer,
                dispatch,
                currentSolver,
                currentOutcomeCollection,
                currentIdPath,
            }}
        >
            {props.children}
        </ComposerContext.Provider>
    )
}

function useComposerContext() {
    const context = React.useContext(ComposerContext)
    if (context === undefined) {
        throw new Error(
            'useComposerContext must be used within a ComposerContextProvider'
        )
    }
    return context
}

export { ComposerContextProvider, useComposerContext }
