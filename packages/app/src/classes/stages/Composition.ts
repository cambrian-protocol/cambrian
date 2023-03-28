import { CompositionModel } from '../../models/CompositionModel'
import CompositionService from '@cambrian/app/services/stages/CompositionService'
import { DocumentModel } from '@cambrian/app/services/api/cambrian.api'
import { UserType } from '@cambrian/app/store/UserContext'

export default class Composition {
    private _auth?: UserType | null
    private _compositionDoc: DocumentModel<CompositionModel>
    private _compositionService: CompositionService


    constructor(compositionDoc: DocumentModel<CompositionModel>, compositionService: CompositionService, auth?: UserType | null) {
        this._auth = auth
        this._compositionDoc = compositionDoc
        this._compositionService = compositionService
    }

    public get content(): CompositionModel {
        return this._compositionDoc.content
    }

    public get doc(): DocumentModel<CompositionModel> {
        return this._compositionDoc
    }

    public async create() {
        if (!this._auth) {
            return
        }

        try {
            return await this._compositionService.create(this._auth, this._compositionDoc.content.title, this._compositionDoc.content)
        } catch (e) {
            console.error(e)
        }
    }

    public async updateContent(updatedComposition: CompositionModel) {
        if (!this._auth) {
            return
        }
        try {
            const _uniqueTitle = await this._compositionService.update(this._auth, this._compositionDoc, updatedComposition)
            if (_uniqueTitle) {
                this._compositionDoc.content = { ...updatedComposition, title: _uniqueTitle }
                return _uniqueTitle
            }
            return
        } catch (e) {
            console.error(e)
        }
    }

    public async archive() {
        if (!this._auth) {
            return
        }

        try {
            await this._compositionService.archive(this._auth, this._compositionDoc.streamID)
        } catch (e) {
            console.error(e)
        }

    }
}