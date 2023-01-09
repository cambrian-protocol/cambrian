import { SCHEMA_VER } from '@cambrian/app/config'
import { StringHashmap } from '@cambrian/app/models/UtilityModels'
import { updateBaseStageLibToSchema } from '@cambrian/app/utils/transformers/schema/stageLibs/BaseStageLibTransformer'

export type BaseStageLibType = {
    _schemaVer?: number
    lib: StringHashmap
    archive: {
        lib: string[]
    }
}

export const defaultBaseStagesLib: BaseStageLibType = {
    _schemaVer: SCHEMA_VER['baseStageLib'],
    lib: {},
    archive: { lib: [] },
}

export default class BaseStageLib {
    protected _schemaVer?: number = SCHEMA_VER['baseStageLib']
    protected _lib = defaultBaseStagesLib.lib
    protected _archive = defaultBaseStagesLib.archive

    constructor(baseLib: BaseStageLibType) {
        this.update(baseLib)
    }

    public get lib() {
        return this._lib
    }

    public get archive() {
        return this._archive
    }

    public get data() {
        return {
            _schemaVer: this._schemaVer,
            lib: this._lib,
            archive: this._archive,
        }
    }

    public update(baseLib: BaseStageLibType) {
        const updatedBaseLib = updateBaseStageLibToSchema(
            SCHEMA_VER['baseStageLib'],
            baseLib
        )
        this._schemaVer = updatedBaseLib._schemaVer
        this._lib = updatedBaseLib.lib || defaultBaseStagesLib.lib
        this._archive = updatedBaseLib.archive || defaultBaseStagesLib.archive
    }

    public addStageWithUniqueTitle(streamID: string, title: string): string {
        const uniqueTitle = this.getUniqueTitle(title.trim())
        this._lib[streamID] = uniqueTitle
        return uniqueTitle
    }

    public archiveStage(streamID: string) {
        this._archive.lib.push(streamID)
        delete this._lib[streamID]
    }

    public getUniqueTitle(title: string) {
        let counter = 1
        let uniqueValue = title
        const titleHasmap: StringHashmap = {}
        // Flipping keys with values
        Object.keys(this._lib).forEach(
            (key) => (titleHasmap[this._lib[key]] = key)
        )

        while (titleHasmap[uniqueValue]) {
            uniqueValue = title + ` (${counter++})`
        }
        return uniqueValue
    }

    public updateTitle(streamID: string, title: string): string {
        const uniqueTitle = this.getUniqueTitle(title.trim())
        this._lib[streamID] = uniqueTitle
        return uniqueTitle
    }
}
