import { StringHashmap } from '@cambrian/app/models/UtilityModels'

export type BaseStageLibType = {
    lib?: StringHashmap // Deprecated
    streamIDs: StringHashmap
    archive: {
        streamIDs: string[]
        lib?: StringHashmap // Deprecated
    }
}

export const defaultBaseStagesLib: BaseStageLibType = {
    streamIDs: {},
    archive: { streamIDs: [] },
}

export default class BaseStageLib {
    protected _streamIDs = defaultBaseStagesLib.streamIDs
    protected _archive = defaultBaseStagesLib.archive

    constructor(baseLib: BaseStageLibType) {
        this.update(baseLib)
    }

    public get streamIDs() {
        return this._streamIDs
    }

    public get archive() {
        return this._archive
    }

    public get lib() {
        return { streamIDs: this._streamIDs, archive: this._archive }
    }

    public update(baseStageLib: BaseStageLibType) {
        this._streamIDs = baseStageLib.streamIDs
        this._archive = baseStageLib.archive
    }

    public addStageWithUniqueTitle(streamID: string, title: string): string {
        const uniqueTitle = this.getUniqueTitle(title.trim())
        this._streamIDs[streamID] = uniqueTitle
        return uniqueTitle
    }

    public archiveStage(streamID: string) {
        this._archive.streamIDs.push(streamID)
        delete this._streamIDs[streamID]
    }

    public getUniqueTitle(title: string) {
        let counter = 1
        let uniqueValue = title
        const titleHasmap: StringHashmap = {}
        // Flipping keys with values
        Object.keys(this._streamIDs).forEach(
            (key) => (titleHasmap[this._streamIDs[key]] = key)
        )

        // To o(1) check if title exists
        while (titleHasmap[uniqueValue]) {
            uniqueValue = title + ` (${counter++})`
        }
        return uniqueValue
    }

    public updateTitle(streamID: string, title: string): string {
        const uniqueTitle = this.getUniqueTitle(title.trim())
        this._streamIDs[streamID] = uniqueTitle
        return uniqueTitle
    }
}
