import { Elements, FlowElement } from 'react-flow-renderer'

import { ComposerIdPathType } from '@cambrian/app/models/SolverModel'
import ComposerSolver from '../classes/ComposerSolver'

// TODO Composition Title and description
export type CompositionModel = {
    compositionID?: string
    streamID?: string
    flowElements: Elements
    currentElement?: FlowElement
    currentIdPath?: ComposerIdPathType
    solvers: ComposerSolver[]
}
