import {
    BaseStageLibType,
    defaultBaseStagesLib,
} from '@cambrian/app/classes/stageLibs/BaseStageLib'

import { StringHashmap } from '@cambrian/app/models/UtilityModels'

/**
 * Functions to update schema versions for backwards compatibility.
 */

const baseStageLibUpdaters = [updateBaseStageLibFromVersion0]

export function updateBaseStageLibToSchema(
    schemaVer: number,
    baseStageLib: BaseStageLibType
) {
    if (!baseStageLib) return defaultBaseStagesLib

    if (
        baseStageLib._schemaVer === undefined ||
        baseStageLib._schemaVer !== schemaVer
    ) {
        baseStageLib = baseStageLibUpdaters[schemaVer - 1](baseStageLib)
    }
    return baseStageLib
}

/**
 * Flips keys with values at the lib map and changes the archive-lib from map to array with the map values as entries
 */
export function updateBaseStageLibFromVersion0(
    baseStageLib: BaseStageLibType
): BaseStageLibType {
    const flippedLib: StringHashmap = {}
    if (baseStageLib.lib) {
        Object.keys(baseStageLib.lib).forEach(
            (title) => (flippedLib[baseStageLib.lib[title]] = title)
        )
    }

    const archiveArray: string[] = []
    if (
        baseStageLib.archive &&
        baseStageLib.archive.lib &&
        Object.values(baseStageLib.archive.lib).length > 0
    ) {
        archiveArray.push(...Object.values(baseStageLib.archive.lib))
    }
    return { _schemaVer: 1, lib: flippedLib, archive: { lib: archiveArray } }
}
