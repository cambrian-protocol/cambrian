import {
    TemplateStagesLibType,
    defaultTemplateStagesLib,
} from '@cambrian/app/classes/stageLibs/TemplateStageLib'

import { updateBaseStageLibFromVersion0 } from './BaseStageLibTransformer'

/**
 * Functions to update schema versions for backwards compatibility.
 */

const templateStageLibUpdaters = [updateTemplateStagesLibFromVersion0]

export function updateTemplateStagesLibToSchema(
    schemaVer: number,
    templateStagesLib: TemplateStagesLibType
) {
    if (!templateStagesLib) return defaultTemplateStagesLib

    if (
        templateStagesLib._schemaVer === undefined ||
        templateStagesLib._schemaVer < schemaVer
    ) {
        templateStagesLib =
            templateStageLibUpdaters[schemaVer - 1](templateStagesLib)
    }

    return templateStagesLib
}

/**
 *  Updates extended updateBaseStageLibFromVersion0 and changes the receivedProposals map
 *  to an array with the maps values as entries
 *
 */
export function updateTemplateStagesLibFromVersion0(
    templateStagesLib: TemplateStagesLibType
): TemplateStagesLibType {
    const updatedBaseLib = updateBaseStageLibFromVersion0(templateStagesLib)

    const receivedProposalsArray: string[] = []
    if (Object.keys(templateStagesLib.archive.receivedProposals).length > 0) {
        receivedProposalsArray.push(
            ...Object.values(templateStagesLib.archive.receivedProposals)
        )
    }

    return {
        _schemaVer: 1,
        lib: updatedBaseLib.lib,
        archive: {
            lib: updatedBaseLib.archive.lib,
            receivedProposals: receivedProposalsArray,
        },
    }
}
