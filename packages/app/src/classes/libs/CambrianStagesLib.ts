import BaseStageLib, {
    BaseStageLibType,
    defaultBaseStagesLib,
} from './BaseStageLib'
import TemplateStageLib, {
    TemplateStagesLibType,
    defaultTemplateStagesLib,
} from './TemplateStageLib'

export type CambrianStagesLibType = {
    recents: string[]
    proposals: BaseStageLibType
    templates: TemplateStagesLibType
    compositions: BaseStageLibType
}

export const defaultCambrianStagesLib: CambrianStagesLibType = {
    recents: [],
    proposals: { ...defaultBaseStagesLib },
    templates: { ...defaultTemplateStagesLib },
    compositions: { ...defaultBaseStagesLib },
}

export default class CambrianStagesLib {
    protected _recents: string[] = defaultCambrianStagesLib.recents
    protected _proposals = new BaseStageLib(defaultCambrianStagesLib.proposals)
    protected _templates = new TemplateStageLib(
        defaultCambrianStagesLib.templates
    )
    protected _compositions = new BaseStageLib(
        defaultCambrianStagesLib.compositions
    )

    constructor(cambrianStagesLib: CambrianStagesLibType) {
        this.update(cambrianStagesLib)
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

    public get lib(): CambrianStagesLibType {
        return {
            recents: this._recents,
            compositions: this._compositions.lib,
            proposals: this._proposals.lib,
            templates: this._templates.lib,
        }
    }

    public update(cambrianStagesLib: CambrianStagesLibType) {
        this._recents = cambrianStagesLib.recents
        this._proposals.update(cambrianStagesLib.proposals)
        this._templates.update(cambrianStagesLib.templates)
        this._compositions.update(cambrianStagesLib.compositions)
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
}
