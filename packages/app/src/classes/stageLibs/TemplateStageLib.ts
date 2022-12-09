import { updateTemplateStagesLibToSchema } from '@cambrian/app/utils/transformers/schema/stageLibs/TemplateStageLibTransformer'
import { SCHEMA_VER } from 'packages/app/config'
import BaseStageLib, {
    BaseStageLibType,
    defaultBaseStagesLib,
} from './BaseStageLib'

export type TemplateStagesLibType = BaseStageLibType & {
    archive: {
        receivedProposals: string[]
    }
}

export const defaultTemplateStagesLib: TemplateStagesLibType = {
    ...defaultBaseStagesLib,
    archive: { ...defaultBaseStagesLib.archive, receivedProposals: [] },
}

export default class TemplateStageLib extends BaseStageLib {
    protected _schemaVer?: number = SCHEMA_VER['templateStageLib']
    protected _archive = defaultTemplateStagesLib.archive

    constructor(templateLib: TemplateStagesLibType) {
        super(templateLib)
        this.update(templateLib)
    }

    public override get archive() {
        return this._archive
    }

    public override get data() {
        return {
            _schemaVer: this._schemaVer,
            lib: this._lib,
            archive: this._archive,
        }
    }

    public archiveReceivedProposal(proposalStreamID: string) {
        this._archive.receivedProposals.push(proposalStreamID)
    }

    public override update(templateLib: TemplateStagesLibType) {
        const updatedTemplateLib = updateTemplateStagesLibToSchema(
            SCHEMA_VER['templateStageLib'],
            templateLib
        )

        this._schemaVer = updatedTemplateLib._schemaVer
        this._lib = updatedTemplateLib.lib
        this._archive = updatedTemplateLib.archive
    }
}
