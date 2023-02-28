import { ReceivedProposalsHashmapType, TemplateModel } from '../models/TemplateModel'

import { FlexInputFormType } from '../ui/templates/forms/TemplateFlexInputsForm'
import { SCHEMA_VER } from '@cambrian/app/config'
import { TemplatePriceModel } from '@cambrian/app/models/TemplateModel';

export default class Template {
    protected _schemaVer?: number = SCHEMA_VER['template']
    protected _title: string
    protected _description: string
    protected _requirements: string
    protected _flexInputs: FlexInputFormType[]
    protected _composition: {
        streamID: string
        commitID: string
    }
    protected _price: TemplatePriceModel
    protected _author: string // DID
    protected _receivedProposals: ReceivedProposalsHashmapType
    protected _isActive?: boolean


    constructor({ schemaVer, title, description, requirements, flexInputs, composition, price, author, receivedProposals, isActive }: TemplateModel) {
        this._schemaVer = schemaVer || SCHEMA_VER['template']
        this._title = title
        this._description = description
        this._requirements = requirements
        this._flexInputs = flexInputs
        this._composition = composition // TODO Update schemaVer and rename to compositionRef
        this._price = price
        this._author = author
        this._receivedProposals = receivedProposals
        this._isActive = isActive // TODO Update schemaVer and rename to isPublished
    }

    public get data(): TemplateModel {
        return {
            title: this._title,
            description: this._description,
            requirements: this._requirements,
            flexInputs: this._flexInputs,
            composition: this._composition,
            price: this._price,
            author: this._author,
            receivedProposals: this._receivedProposals,
            isActive: this._isActive,
        }
    }

    public async create() { }

    // Former toggleActivate
    public async publish() { }

    // Former toggleActivate
    public async unpublish() { }

    public async archive() { }
}
