import BaseStageLib, {
    BaseStageLibType,
    defaultBaseStagesLib,
} from './BaseStageLib'
import TemplateStageLib, {
    TemplateStagesLibType,
    defaultTemplateStagesLib,
} from './TemplateStageLib'

import { SCHEMA_VER } from '@cambrian/app/config'
import { StageNames } from '@cambrian/app/models/StageModel';
import { updateCambrianStagesLibToSchema } from '@cambrian/app/utils/transformers/schema/stageLibs/CambrianStagesLibTransformer'

export type CambrianStagesLibType = {
    _schemaVer?: number
    recents: string[]
    proposals: BaseStageLibType
    templates: TemplateStagesLibType
    compositions: BaseStageLibType
}

export const defaultCambrianStagesLib: CambrianStagesLibType = {
    _schemaVer: SCHEMA_VER['cambrianStagesLib'],
    recents: [],
    proposals: { ...defaultBaseStagesLib },
    templates: { ...defaultTemplateStagesLib },
    compositions: { ...defaultBaseStagesLib },
}

export default class CambrianStagesLib {
    protected _schemaVer?: number = defaultCambrianStagesLib._schemaVer
    protected _recents: string[] = defaultCambrianStagesLib.recents
    protected _proposals = new BaseStageLib(defaultCambrianStagesLib.proposals)
    protected _templates = new TemplateStageLib(
        defaultCambrianStagesLib.templates
    )
    protected _compositions = new BaseStageLib(
        defaultCambrianStagesLib.compositions
    )

    constructor(cambrianStagesLib?: CambrianStagesLibType) {
        this.update(cambrianStagesLib || defaultCambrianStagesLib)
    }

    public get recents() {
        return this._recents
    }

    public get compositions() {
        return this._compositions
    }

    public get templates() {
        return this._templates
    }
    public get proposals() {
        return this._proposals
    }

    public get data(): CambrianStagesLibType {
        return {
            _schemaVer: this._schemaVer,
            recents: this._recents,
            compositions: this._compositions.data,
            proposals: this._proposals.data,
            templates: this._templates.data,
        }
    }

    public update(cambrianStagesLib: CambrianStagesLibType) {
        const updatedCambrianStagesLib = updateCambrianStagesLibToSchema(
            SCHEMA_VER['cambrianStagesLib'],
            cambrianStagesLib
        )
        this._schemaVer = updatedCambrianStagesLib._schemaVer
        this._recents = updatedCambrianStagesLib.recents || []
        this._proposals.update(updatedCambrianStagesLib.proposals)
        this._templates.update(updatedCambrianStagesLib.templates)
        this._compositions.update(updatedCambrianStagesLib.compositions)
    }

    public addRecent(streamID: string) {
        const updatedItems: string[] = [...this._recents]
        const idx = updatedItems.findIndex((s) => s === streamID)
        if (idx !== -1) {
            updatedItems.splice(idx, 1)
        }
        updatedItems.push(streamID)
        this._recents = updatedItems
    }

    public addStage(stageStreamId: string, title: string, stageName: StageNames) {
        switch (stageName) {
            case StageNames.composition:
                return this._compositions.addStageWithUniqueTitle(stageStreamId, title)
            case StageNames.template:
                return this._templates.addStageWithUniqueTitle(stageStreamId, title)
            case StageNames.proposal:
                return this._proposals.addStageWithUniqueTitle(stageStreamId, title)
            default:
                break
        }
    }

}
