import {
    ComposerIdPathType,
    ComposerSolverModel,
} from '@cambrian/app/models/SolverModel'
import { Elements, FlowElement } from 'react-flow-renderer'

// TODO Composition Title and description
export type CompositionModel = {
    flowElements: Elements
    currentElement?: FlowElement
    currentIdPath?: ComposerIdPathType
    solvers: ComposerSolverModel[]
}
