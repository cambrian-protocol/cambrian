import {
    CAMBRIAN_DID,
    CERAMIC_NODE_ENDPOINT,
    SCHEMA_VER,
    TRILOBOT_ENDPOINT,
} from 'packages/app/config'
import { StageModel, StageNames } from '../../models/StageModel'

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

import { CommitID } from '@ceramicnetwork/streamid'
import CambrianStagesLib, {
    CambrianStagesLibType,
    defaultCambrianStagesLib,
} from '@cambrian/app/classes/stageLibs/CambrianStagesLib'

export const CAMBRIAN_LIB_NAME = 'cambrian-lib'

export const ceramicInstance = (currentUser: UserType) => {
    const ceramicClient = new CeramicClient(CERAMIC_NODE_ENDPOINT)
    if (currentUser.session) {
        ceramicClient.did = currentUser.session.did
    }
    return ceramicClient
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
        cpLogger.pushError(e)
        throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']
    }
}

export const getDIDfromAddress = (address: string, chainId: number) => {
    return `did:pkh:eip155:${chainId}:${address}`
}

export const getAddressFromDID = (did: string) => {
    return did.slice(-42)
}

/**
 * Loads users stages-lib.
 *
 * @param currentUser
 * @returns
 */
export const loadStagesLib = async (currentUser: UserType) => {
    try {
        if (!currentUser.session || !currentUser.did)
            throw GENERAL_ERROR['NO_CERAMIC_CONNECTION']

        const stagesLibDoc = (await TileDocument.deterministic(
            ceramicInstance(currentUser),
            {
                controllers: [currentUser.did],
                family: CAMBRIAN_LIB_NAME,
                tags: ['stages'],
            },
            { pin: true }
        )) as TileDocument<CambrianStagesLibType>

        const updatedStagesLib = new CambrianStagesLib(stagesLibDoc.content)
        if (!_.isEqual(updatedStagesLib.data, stagesLibDoc.content)) {
            // Backup stagesLib and update Schema Version
            console.log(
                'Backing up stagesLib schema version:',
                stagesLibDoc.content._schemaVer?.toString() || '0'
            )
            const backupDoc = await TileDocument.deterministic(
                ceramicInstance(currentUser),
                {
                    controllers: [currentUser.did],
                    family: 'cambrianStagesLibBackup',
                    tags: [stagesLibDoc.content._schemaVer?.toString() || '0'],
                },
                { pin: true }
            )
            await backupDoc.update(stagesLibDoc.content)
            console.log(
                'Updating stagesLib to schema version: ',
                SCHEMA_VER['cambrianStagesLib']
            )
            await stagesLibDoc.update(updatedStagesLib.data)
        }

        return stagesLibDoc
    } catch (e) {
        cpLogger.pushError(e)
        throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
    }
}

/**
 * Moves stage from provided stagesLib to its archive.
 *
 * @param currentUser
 * @param streamID
 * @param stageName
 */
export const archiveStage = async (
    currentUser: UserType,
    streamID: string,
    stageName: StageNames
) => {
    try {
        const stagesLib = await loadStagesLib(currentUser)
        const updatedStagesLib = new CambrianStagesLib(stagesLib.content)
        switch (stageName) {
            case StageNames.composition:
                updatedStagesLib.compositions.archiveStage(streamID)
                break
            case StageNames.template:
                updatedStagesLib.templates.archiveStage(streamID)
                break
            case StageNames.proposal:
                updatedStagesLib.proposals.archiveStage(streamID)
                break
            default:
                break
        }
        await stagesLib.update(updatedStagesLib.data)
    } catch (e) {
        cpLogger.pushError(e)
        throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
    }
}

/**
 * Loads the corresponding proposal, template and composition from the passed proposalCommitID and stores the provided streamID for convience.
 *
 * @param proposalStreamID
 * @param proposalCommitID
 * @returns StageStack
 */
export const loadStageStackFromID = async (
    proposalStreamID: string,
    proposalCommitID?: string
): Promise<StageStackType> => {
    const proposalDoc = <TileDocument<ProposalModel>>(
        await loadCommitWorkaround(
            proposalCommitID ? proposalCommitID : proposalStreamID
        )
    )

    const templateContent = <TemplateModel>(
        (await loadCommitWorkaround(proposalDoc.content.template.commitID))
            .content
    )

    const compositionContent = <CompositionModel>(
        (await loadCommitWorkaround(templateContent.composition.commitID))
            .content
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
): Promise<{ streamID: string; title: string }> => {
    try {
        if (!currentUser.session || !currentUser.did)
            throw GENERAL_ERROR['NO_CERAMIC_CONNECTION']

        const stagesLibDoc = await loadStagesLib(currentUser)
        const updatedStages = new CambrianStagesLib(stagesLibDoc.content)

        const stageStreamDoc = await TileDocument.create(
            ceramicInstance(currentUser),
            {},
            {
                controllers: [currentUser.did],
                family: `cambrian-${stageName}`,
            }
        )

        const stageStreamID = stageStreamDoc.id.toString()
        let uniqueTitle = stage.title
        switch (stageName) {
            case StageNames.composition:
                uniqueTitle =
                    updatedStages.compositions.addStageWithUniqueTitle(
                        stageStreamID,
                        uniqueTitle
                    )
                break
            case StageNames.template:
                uniqueTitle = updatedStages.templates.addStageWithUniqueTitle(
                    stageStreamID,
                    uniqueTitle
                )
                break
            case StageNames.proposal:
                uniqueTitle = updatedStages.proposals.addStageWithUniqueTitle(
                    stageStreamID,
                    uniqueTitle
                )
                break
            default:
                break
        }

        await stageStreamDoc.update({ ...stage, title: uniqueTitle })
        await stagesLibDoc.update(updatedStages.data)
        return { streamID: stageStreamID, title: uniqueTitle }
    } catch (e) {
        cpLogger.pushError(e)
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

        let uniqueTitle = updatedStage.title
        if (currentStage.content.title !== uniqueTitle) {
            const stagesLibDoc = await loadStagesLib(currentUser)
            const updatedStages = new CambrianStagesLib(stagesLibDoc.content)
            // Updating StagesLib
            switch (stageName) {
                case StageNames.composition:
                    uniqueTitle = updatedStages.compositions.updateTitle(
                        streamID,
                        uniqueTitle
                    )
                    break
                case StageNames.template:
                    uniqueTitle = updatedStages.templates.updateTitle(
                        streamID,
                        uniqueTitle
                    )
                    break
                case StageNames.proposal:
                    uniqueTitle = updatedStages.proposals.updateTitle(
                        streamID,
                        uniqueTitle
                    )
                    break
                default:
                    break
            }
            await stagesLibDoc.update(updatedStages.data)
        }

        await currentStage.update({
            ...updatedStage,
            title: uniqueTitle,
        })

        // NOTE: Workaround until Ceramics load commitID Bugfix is merged
        await saveCambrianCommitData(
            currentUser,
            currentStage.commitId.toString()
        )

        return uniqueTitle
    } catch (e) {
        cpLogger.pushError(e)
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
        const stagesLib = new CambrianStagesLib(stagesLibDoc.content)
        if (stagesLib.recents[stagesLib.recents.length - 1] !== streamID) {
            stagesLib.addRecent(streamID)
            await stagesLibDoc.update(stagesLib.data)
        }
    } catch (e) {
        cpLogger.pushError(e)
        throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
    }
}

export const clearStagesLib = async (currentUser: UserType) => {
    const stagesLib = await loadStagesLib(currentUser)
    await stagesLib.update(defaultCambrianStagesLib)
}

// NOTE: Temporary workaround until Cermics Bugfix is merged.
export const saveCambrianCommitData = async (
    currentUser: UserType,
    commitID: string
) => {
    try {
        if (!currentUser.session || !currentUser.did)
            throw GENERAL_ERROR['NO_CERAMIC_CONNECTION']

        const res = await fetch(`${TRILOBOT_ENDPOINT}/saveCommit`, {
            method: 'POST',
            body: JSON.stringify({
                id: commitID,
                session: currentUser.session.serialize(),
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (res.status !== 200)
            throw new Error('TriloBot could not save commit.')

        console.log(res)

        return res
    } catch (e) {
        cpLogger.pushError(e)
    }
}

// NOTE: Function to fallback on saved cambrianCommitData until Cermics bugfix is merged
export const loadCommitWorkaround = async <T>(
    commitID: string
): Promise<TileDocument<T>> => {
    const ceramicClient = new CeramicClient(CERAMIC_NODE_ENDPOINT)
    try {
        return (await TileDocument.load(
            ceramicClient,
            commitID
        )) as TileDocument<T>
    } catch (e) {
        console.warn('Loading Ceramic Commit failed. Fallback will be used.', e)
    }

    try {
        const cambrianCommit = (await TileDocument.deterministic(
            ceramicClient,
            {
                controllers: [CAMBRIAN_DID],
                family: 'cambrian-commits',
                tags: [commitID],
            }
        )) as TileDocument<T>

        if (
            cambrianCommit.content !== null &&
            typeof cambrianCommit.content === 'object' &&
            Object.keys(cambrianCommit.content).length > 0
        ) {
            return cambrianCommit
        } else {
            throw new Error(`Provided CommitID not found ${commitID}`)
        }
    } catch (e) {
        console.log('loading anchor backup')

        try {
            const streamDoc = (await TileDocument.load(
                ceramicClient,
                streamIDFromCommitID(commitID)
            )) as TileDocument<Record<string, any>>

            const nextAnchor = findNextAnchor(commitID, streamDoc)
            console.log('nextAnchor: ', nextAnchor)

            if (nextAnchor) {
                const cambrianCommit = (await TileDocument.deterministic(
                    ceramicClient,
                    {
                        controllers: [CAMBRIAN_DID],
                        family: 'cambrian-commits',
                        tags: [nextAnchor],
                    }
                )) as TileDocument<T>

                console.log('cambrian commit: ', cambrianCommit)

                if (
                    cambrianCommit.content !== null &&
                    typeof cambrianCommit.content === 'object'
                ) {
                    return cambrianCommit
                } else {
                    throw new Error(`Provided CommitID not found ${commitID}`)
                }
            } else {
                throw new Error(
                    `Provided CommitID ${commitID} and no subsequent anchor found`
                )
            }
        } catch (e) {
            cpLogger.pushError(e)
            throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']
        }
    }
}

export const streamIDFromCommitID = (id: string) => {
    const commitID = CommitID.fromString(id)
    return commitID.baseID.toString()
}

const findNextAnchor = (
    commitID: string,
    streamDoc: TileDocument<Record<string, any>>
) => {
    if (
        commitID ===
        streamDoc.anchorCommitIds[
            streamDoc.anchorCommitIds.length - 1
        ].toString()
    ) {
        return commitID
    }

    const commitIdx = streamDoc.allCommitIds.findIndex(
        (commit) => commit.toString() === commitID
    )

    const susbequentCommits = streamDoc.allCommitIds
        .slice(commitIdx)
        .map((commit) => commit.toString())

    const nextAnchor = streamDoc.anchorCommitIds.find((commit) =>
        susbequentCommits.includes(commit.toString())
    )

    if (nextAnchor) {
        return nextAnchor.toString()
    } else {
        return null
    }
}
