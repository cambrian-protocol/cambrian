import { CambrianStagesLibType } from '@cambrian/app/classes/stageLibs/CambrianStagesLib'

/**
 * Functions to update schema versions for backwards compatibility.
 */

const cambrianStagesLibUpdaters = [updateCambrianStagesLibFromVersion0]

export function updateCambrianStagesLibToSchema(
    schemaVer: number,
    stagesLib: CambrianStagesLibType
) {
    if (!stagesLib._schemaVer || stagesLib._schemaVer < schemaVer) {
        stagesLib = cambrianStagesLibUpdaters[schemaVer - 1](stagesLib)
    }
    return stagesLib
}

/**
 * Just adds the schema version
 */
export function updateCambrianStagesLibFromVersion0(
    stagesLib: CambrianStagesLibType
) {
    stagesLib._schemaVer = 1
    return stagesLib
}
