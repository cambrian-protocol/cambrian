import ComposerSolver from '../ComposerSolver'
import { CompositionModel } from '../../models/CompositionModel'
import { Elements } from 'react-flow-renderer'
import { SCHEMA_VER } from '@cambrian/app/config'

export default class Composition {
    protected _schemaVer?: number = SCHEMA_VER['composition']
    protected _title: string
    protected _description: string
    protected _flowElements: Elements
    protected _solvers: ComposerSolver[]


    constructor({ schemaVer, title, description, flowElements, solvers }: CompositionModel) {
        this._schemaVer = schemaVer || SCHEMA_VER['composition']
        this._title = title
        this._description = description
        this._flowElements = flowElements
        this._solvers = solvers
    }

    public get data(): CompositionModel {
        return {
            title: this._title,
            description: this._description,
            flowElements: this._flowElements,
            solvers: this._solvers
        }
    }

    public async create() {
    }

    public async archive() { }
}
