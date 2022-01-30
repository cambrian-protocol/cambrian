import { ComposerStateType } from './composer.types'
import { Elements } from 'react-flow-renderer'
import Solver from '@cambrian/app/classes/Solver'

function initComposer(): ComposerStateType {
    const defaultSolver = new Solver()

    const initalElements: Elements = [
        {
            id: `${defaultSolver.id}`,
            type: 'solver',
            position: { x: 300, y: 200 },
            data: { label: defaultSolver.title },
        },
        {
            id: `${defaultSolver.id}/${defaultSolver.config.condition.partition[0].id}`,
            type: 'oc',
            position: { x: 300, y: 400 },
            data: { label: 'Outcome Collection #1' },
        },
        {
            id: `e${defaultSolver.id}-${defaultSolver.id}/${defaultSolver.config.condition.partition[0].id}`,
            source: `${defaultSolver.id}`,
            type: 'step',
            target: `${defaultSolver.id}/${defaultSolver.config.condition.partition[0].id}`,
        },
    ]

    return <ComposerStateType>{
        flowElements: initalElements,
        solvers: [defaultSolver],
    }
}

const initialComposer = initComposer()

export default initialComposer
