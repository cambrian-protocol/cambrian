import { ComposerAction, ComposerStateType } from './composer.types'
import { IdPathType, SolverModel } from '../../models/SolverModel'
import React, {
    PropsWithChildren,
    useEffect,
    useReducer,
    useState,
} from 'react'

import { OutcomeCollectionModel } from '@cambrian/app/src/models/ConditionModel'
import Solver from '@cambrian/app/classes/Solver'
import { composerReducer } from './composer.reducer'
import initialComposer from './composer.init'

type ComposerContextOptions = {
    composer: ComposerStateType
    dispatch: React.Dispatch<ComposerAction>
    currentIdPath?: IdPathType
    currentSolver?: Solver
    currentOutcomeCollection?: OutcomeCollectionModel
}

const ComposerContext = React.createContext<ComposerContextOptions>({
    composer: {
        flowElements: [],
        solvers: [],
    },
    dispatch: () => {},
})

const ComposerContextProvider = (props: PropsWithChildren<{}>) => {
    const [composer, dispatch] = useReducer(composerReducer, initialComposer)

    const [currentIdPath, setCurrentIdPath] = useState<IdPathType>()
    const [currentSolver, setCurrentSolver] = useState<Solver>()
    const [currentOutcomeCollection, setCurrentOutcomeCollection] =
        useState<OutcomeCollectionModel>()

    useEffect(() => {
        // Keeps track which Solver and OutcomeSelection is selected
        if (
            composer.currentIdPath !== undefined &&
            composer.currentIdPath.solverId !== undefined &&
            composer.currentIdPath.solverId.length
        ) {
            const currentSolver = composer.solvers.find(
                (x) => x.id === composer.currentIdPath?.solverId
            )
            setCurrentSolver(currentSolver)

            if (
                composer.currentIdPath.ocId !== undefined &&
                composer.currentIdPath.ocId.length
            ) {
                setCurrentOutcomeCollection(
                    currentSolver?.config.condition.partition.find(
                        (oc) => oc.id === composer.currentIdPath?.ocId
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