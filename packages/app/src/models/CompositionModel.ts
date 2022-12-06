import { Elements, FlowElement } from 'react-flow-renderer'

import { ComposerIdPathType } from '@cambrian/app/models/SolverModel'
import ComposerSolver from '../classes/ComposerSolver'

export type CompositionModel = {
    id: string
    schemaVer?: number
    title: string
    description: string
    currentElement?: FlowElement
    currentIdPath?: ComposerIdPathType
    flowElements: Elements
    solvers: ComposerSolver[]
}
