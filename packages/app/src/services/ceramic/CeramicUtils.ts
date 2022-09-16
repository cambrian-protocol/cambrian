import {
    CAMBRIAN_DID,
    CERAMIC_NODE_ENDPOINT,
    TRILOBOT_ENDPOINT,
} from 'packages/app/config'
import { StageModel, StageNames } from '../../models/StageModel'
import {
    getUniqueTag,
    updateKeyFromValue,
} from '@cambrian/app/utils/helpers/hashmapHelper'

import { CambrianStagesLibType } from './../../models/StageModel'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { StageStackType } from '@cambrian/app/ui/dashboard/ProposalsDashboardUI'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '@cambrian/app/store/UserContext'
import _ from 'lodash'
import { cpLogger } from '../api/Logger.api'
import { pushUnique } from '@cambrian/app/utils/helpers/arrayHelper'
import { SubmissionModel } from '@cambrian/app/ui/moduleUIs/IPFSTextSubmitter/models/SubmissionModel'

export const CAMBRIAN_LIB_NAME = 'cambrian-lib'

export const initialStagesLib = {
    recents: [],
    compositions: { lib: {}, archive: { lib: {} } },
    templates: { lib: {}, archive: { lib: {}, receivedProposals: {} } },
    proposals: { lib: {}, archive: { lib: {} } },
}

export const ceramicInstance = (currentUser: UserType) => {
    const ceramicClient = new CeramicClient(CERAMIC_NODE_ENDPOINT)
    ceramicClient.did = currentUser.session.did
    return ceramicClient
}

// NOTE: Function to fallback on saved cambrianCommitData until Cermics bugfix is merged
export const loadCommitWorkaround = async <T>(
    currentUser: UserType,
    commitID: string
): Promise<TileDocument<T>> => {
    try {
        return (await TileDocument.load(
            ceramicInstance(currentUser),
            commitID
        )) as TileDocument<T>
    } catch (e) {
        console.warn('Loading Cermic Commit failed. Fallback will be used.', e)
    }

    try {
        const cambrianCommit = (await TileDocument.deterministic(
            ceramicInstance(currentUser),
            {
                controllers: [CAMBRIAN_DID],
                family: 'cambrian-commits',
                tags: [commitID],
            }
        )) as TileDocument<T>

        if (
            cambrianCommit.content !== null &&
            typeof cambrianCommit.content === 'object'
        ) {
            return cambrianCommit
        } else {
            throw new Error(`Provided CommitID not found ${commitID}`)
        }
    } catch (e) {
        cpLogger.push(e)
        throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']
    }
}

export const loadStageDoc = async <T>(
    currentUser: UserType,
    streamID: string
) => {
    try {
        return (await TileDocument.load(
            ceramicInstance(currentUser),
            streamID
        )) as TileDocument<T>
    } catch (e) {
        cpLogger.push(e)
        throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']
    }
}

/**
 * Loads users stages-lib.
 *
 * @param currentUser
 * @returns
 */
export const loadStagesLib = async (currentUser: UserType) => {
    try {
        return (await TileDocument.deterministic(
            ceramicInstance(currentUser),
            {
                controllers: [currentUser.did],
                family: CAMBRIAN_LIB_NAME,
                tags: ['stages'],
            },
            { pin: true }
        )) as TileDocument<CambrianStagesLibType>
    } catch (e) {
        cpLogger.push(e)
        throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
    }
}

/**
 * Moves stage from provided stagesLib to its archive.
 *
 * @param currentUser
 * @param tag
 * @param stageName
 */
export const archiveStage = async (
    currentUser: UserType,
    tag: string,
    stageName: StageNames
) => {
    const stagesLib = await loadStagesLib(currentUser)

    let updatedStagesLib = { ...stagesLib.content }

    switch (stageName) {
        case StageNames.composition:
            updatedStagesLib.compositions.archive.lib[tag] =
                updatedStagesLib.compositions.lib[tag]
            delete updatedStagesLib.compositions.lib[tag]
            break
        case StageNames.template:
            updatedStagesLib.templates.archive.lib[tag] =
                updatedStagesLib.templates.lib[tag]
            delete updatedStagesLib.templates.lib[tag]
            break
        case StageNames.proposal:
            updatedStagesLib.proposals.archive.lib[tag] =
                updatedStagesLib.proposals.lib[tag]
            delete updatedStagesLib.proposals.lib[tag]
            break
        default:
            break
    }
    await stagesLib.update(updatedStagesLib)
}

/**
 * Loads the corresponding proposal, template and composition from the passed proposalCommitID and stores the provided streamID for convience.
 *
 * @param proposalStreamID
 * @param proposalCommitID
 * @returns StageStack
 */
export const loadStageStackFromID = async (
    currentUser: UserType,
    proposalStreamID: string,
    proposalCommitID?: string
): Promise<StageStackType> => {
    const proposalDoc = <TileDocument<ProposalModel>>(
        await loadCommitWorkaround(
            currentUser,
            proposalCommitID ? proposalCommitID : proposalStreamID
        )
    )

    const templateContent = <TemplateModel>(
        (
            await loadCommitWorkaround(
                currentUser,
                proposalDoc.content.template.commitID
            )
        ).content
    )

    const compositionContent = <CompositionModel>(
        (
            await loadCommitWorkaround(
                currentUser,
                templateContent.composition.commitID
            )
        ).content
    )

    return {
        proposalStreamID: proposalStreamID,
        proposalCommitID: proposalCommitID
            ? proposalCommitID
            : proposalDoc.commitId.toString(),
        proposal: proposalDoc.content,
        template: templateContent,
        composition: compositionContent,
    }
}

export const createStage = async (
    stage: StageModel,
    stageName: StageNames,
    currentUser: UserType
): Promise<string> => {
    try {
        const stagesLibDoc = await loadStagesLib(currentUser)

        let updatedStagesLib: CambrianStagesLibType = initialStagesLib

        if (
            stagesLibDoc.content !== null &&
            typeof stagesLibDoc.content === 'object'
        ) {
            updatedStagesLib = { ...updatedStagesLib, ...stagesLibDoc.content }
        }

        // Get unique Tag, checks inside lib and archive for existant tags.
        let uniqueTitle = stage.title.trim()
        switch (stageName) {
            case StageNames.composition:
                uniqueTitle = getUniqueTag(
                    {
                        ...updatedStagesLib.compositions.lib,
                        ...updatedStagesLib.compositions.archive.lib,
                    },
                    stage.title
                )
                break
            case StageNames.template:
                uniqueTitle = getUniqueTag(
                    {
                        ...updatedStagesLib.templates.lib,
                        ...updatedStagesLib.templates.archive.lib,
                    },
                    stage.title
                )
                break
            case StageNames.proposal:
                uniqueTitle = getUniqueTag(
                    {
                        ...updatedStagesLib.proposals.lib,
                        ...updatedStagesLib.proposals.archive.lib,
                    },
                    stage.title
                )
                break
            default:
                break
        }

        // Overwrite title if tag wasn't unique
        if (uniqueTitle !== stage.title.trim()) {
            stage = { ...stage, title: uniqueTitle }
        }
        const stageStreamDoc = await TileDocument.deterministic(
            ceramicInstance(currentUser),
            {
                controllers: [currentUser.did],
                family: `cambrian-${stageName}`,
                tags: [uniqueTitle],
            },
            { pin: true }
        )

        await stageStreamDoc.update(stage)
        const stageStreamID = stageStreamDoc.id.toString()

        // Updating StagesLib
        switch (stageName) {
            case StageNames.composition:
                updatedStagesLib.compositions.lib = {
                    ...updatedStagesLib.compositions.lib,
                    [uniqueTitle]: stageStreamID,
                }
                break
            case StageNames.template:
                updatedStagesLib.templates.lib = {
                    ...updatedStagesLib.templates.lib,
                    [uniqueTitle]: stageStreamID,
                }
                break
            case StageNames.proposal:
                updatedStagesLib.proposals.lib = {
                    ...updatedStagesLib.proposals.lib,
                    [uniqueTitle]: stageStreamID,
                }
                break
            default:
                break
        }

        await stagesLibDoc.update(updatedStagesLib)
        return stageStreamID
    } catch (e) {
        cpLogger.push(e)
        throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
    }
}

export const updateStage = async (
    streamID: string,
    updatedStage: StageModel,
    stageName: StageNames,
    currentUser: UserType
): Promise<string> => {
    try {
        const currentStage: TileDocument<StageModel> = await TileDocument.load(
            ceramicInstance(currentUser),
            streamID
        )
        const cleanedUserTitle = updatedStage.title.trim()

        // Title has changed - stagesLib and metaTag must be updated
        if (currentStage.content.title !== cleanedUserTitle) {
            const stagesLibDoc = await loadStagesLib(currentUser)
            let uniqueTitle = cleanedUserTitle

            if (
                stagesLibDoc.content !== null &&
                typeof stagesLibDoc.content === 'object'
            ) {
                let updatedStagesLib: CambrianStagesLibType = {
                    ...stagesLibDoc.content,
                }
                // Updating StagesLib
                switch (stageName) {
                    case StageNames.composition:
                        {
                            const { key, map } = updateKeyFromValue(
                                streamID,
                                cleanedUserTitle,
                                updatedStagesLib.compositions.lib,
                                updatedStagesLib.compositions.archive.lib
                            )
                            uniqueTitle = key
                            updatedStagesLib.compositions.lib = { ...map }
                            await stagesLibDoc.update(updatedStagesLib)
                        }
                        break
                    case StageNames.template:
                        {
                            const { key, map } = updateKeyFromValue(
                                streamID,
                                cleanedUserTitle,
                                updatedStagesLib.templates.lib,
                                updatedStagesLib.templates.archive.lib
                            )
                            uniqueTitle = key
                            updatedStagesLib.templates.lib = { ...map }
                            await stagesLibDoc.update(updatedStagesLib)
                        }
                        break
                    case StageNames.proposal:
                        {
                            const { key, map } = updateKeyFromValue(
                                streamID,
                                cleanedUserTitle,
                                updatedStagesLib.proposals.lib,
                                updatedStagesLib.proposals.archive.lib
                            )
                            uniqueTitle = key
                            updatedStagesLib.proposals.lib = { ...map }
                            await stagesLibDoc.update(updatedStagesLib)
                        }
                        break
                    default:
                        break
                }
            }

            await currentStage.update(
                { ...updatedStage, title: uniqueTitle },
                { ...currentStage.metadata, tags: [uniqueTitle] },
                { pin: true }
            )
            return uniqueTitle
        } else {
            await currentStage.update({
                ...updatedStage,
                title: cleanedUserTitle,
            })
            return cleanedUserTitle
        }
    } catch (e) {
        cpLogger.push(e)
        throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
    }
}

/**
 * Pushes streamID to recents as singleton, removes pre-existent entry and therefore keeps chronological order.
 *
 * @param currentUser
 * @param streamID
 */
export const addRecentStage = async (
    currentUser: UserType,
    streamID: string
) => {
    try {
        const stagesLibDoc = await loadStagesLib(currentUser)

        let updatedStagesLib: CambrianStagesLibType = initialStagesLib

        if (
            stagesLibDoc.content !== null &&
            typeof stagesLibDoc.content === 'object'
        ) {
            updatedStagesLib = { ...updatedStagesLib, ...stagesLibDoc.content }
        }

        if (
            updatedStagesLib.recents[updatedStagesLib.recents.length - 1] !==
            streamID
        ) {
            await stagesLibDoc.update({
                ...updatedStagesLib,
                recents: pushUnique(streamID, updatedStagesLib.recents),
            })
        }
    } catch (e) {
        cpLogger.push(e)
        throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
    }
}

export const clearStagesLib = async (currentUser: UserType) => {
    const stagesLib = await loadStagesLib(currentUser)
    await stagesLib.update(initialStagesLib)
}

// NOTE: Temporary workaround until Cermics Bugfix is merged.
export const saveCambrianCommitData = async (
    currentUser: UserType,
    commitID: string,
    data: CompositionModel | ProposalModel | TemplateModel | SubmissionModel
) => {
    try {
        const res = await fetch(`${TRILOBOT_ENDPOINT}/saveCommit`, {
            method: 'POST',
            body: JSON.stringify({
                id: commitID,
                data: data,
                session: currentUser.session.serialize(),
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (res.status !== 200)
            throw new Error('TriloBot could not save commit.')
    } catch (e) {
        cpLogger.push(e)
    }
}
