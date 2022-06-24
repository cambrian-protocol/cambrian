import { Elements, FlowElement } from 'react-flow-renderer'

import { ComposerIdPathType } from '@cambrian/app/models/SolverModel'
import ComposerSolver from '../classes/ComposerSolver'

// TODO Composition Title and description
export type CompositionModel = {
    currentElement?: FlowElement
    currentIdPath?: ComposerIdPathType
    flowElements: Elements
    solvers: ComposerSolver[]
}
