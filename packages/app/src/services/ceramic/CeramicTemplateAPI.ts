import { CAMBRIAN_LIB_NAME, StageLibType, StageNames } from './CeramicStagehand'
import {
    CeramicTemplateModel,
    ReceivedProposalsHashmapType,
} from '../../models/TemplateModel'

import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { FlexInputFormType } from '@cambrian/app/ui/templates/forms/TemplateFlexInputsForm'
import { GENERAL_ERROR } from '../../constants/ErrorMessages'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '@cambrian/app/store/UserContext'
import _ from 'lodash'
import { ceramicInstance } from './CeramicUtils'
import { cpLogger } from '../api/Logger.api'
import { createStage } from './../../utils/helpers/stageHelpers'
import { pushUnique } from '../../utils/helpers/arrayHelper'

/** 
 API functions to maintain the template-lib for the template dashboard
*/
export default class CeramicTemplateAPI {
    user: UserType

    constructor(currentUser: UserType) {
        this.user = currentUser
    }

    loadTemplateLib = async () => {
        try {
            return (await TileDocument.deterministic(
                ceramicInstance(this.user),
                {
                    controllers: [this.user.did],
                    family: CAMBRIAN_LIB_NAME,
                    tags: [StageNames.template],
                },
                { pin: true }
            )) as TileDocument<StageLibType>
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    loadTemplateDoc = async (templateStreamID: string) => {
        try {
            return (await TileDocument.load(
                ceramicInstance(this.user),
                templateStreamID
            )) as TileDocument<CeramicTemplateModel>
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']
        }
    }

    /**
     * Creates a template from the passed compositionStreamID and adds it to the users template-lib.
     *
     * @param title
     * @param compositionStreamID
     * @returns
     */
    createTemplate = async (
        title: string,
        compositionStreamID: string
    ): Promise<string> => {
        try {
            const composition: TileDocument<CompositionModel> =
                await TileDocument.load(
                    ceramicInstance(this.user),
                    compositionStreamID
                )

            let isCollateralFlex = false
            const formFlexInputs: FlexInputFormType[] = []
            composition.content.solvers.forEach((solver) => {
                Object.keys(solver.slotTags).forEach((tagId) => {
                    if (solver.slotTags[tagId].isFlex === true) {
                        if (tagId === 'collateralToken') {
                            isCollateralFlex = true
                        } else {
                            formFlexInputs.push({
                                ...solver.slotTags[tagId],
                                solverId: solver.id,
                                tagId: tagId,
                                value: '',
                            })
                        }
                    }
                })
            })

            const template: CeramicTemplateModel = {
                title: title,
                description: '',
                requirements: '',
                price: {
                    amount: 0,
                    denominationTokenAddress:
                        composition.content.solvers[0].config.collateralToken ||
                        '',
                    preferredTokens: [],
                    allowAnyPaymentToken: false,
                    isCollateralFlex: isCollateralFlex,
                },
                flexInputs: formFlexInputs,
                composition: {
                    streamID: compositionStreamID,
                    commitID: composition.commitId.toString(),
                },
                author: this.user.did,
                receivedProposals: {},
                isActive: true, // TODO Activate / Deactivate Template feature
            }

            return createStage(template, StageNames.template, this.user)
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    /**
     * Adds a new entry for a submitted proposal at the templates receivedProposals and at proposalLib received proposals if not existent yet
     *
     * @auth Must be done by the templater
     */
    registerNewProposalSubmission = async (proposalStreamID: string) => {
        try {
            const cs = ceramicInstance(this.user)
            const proposalStreamDoc = (await cs.loadStream(
                proposalStreamID
            )) as TileDocument<CeramicProposalModel>
            const templateStreamDoc = (await cs.loadStream(
                proposalStreamDoc.content.template.streamID
            )) as TileDocument<CeramicTemplateModel>

            let updatedReceivedProposals: ReceivedProposalsHashmapType = {}
            if (templateStreamDoc.content.receivedProposals) {
                updatedReceivedProposals = _.cloneDeep(
                    templateStreamDoc.content.receivedProposals
                )
            }
            const proposalStream = await cs.loadStream(proposalStreamID)
            console.log('Proposal ', proposalStream)
            console.log(
                'Proposal Stream Tip (Most recent commitID):',
                proposalStream.tip.toString()
            )

            const proposalCommmitID = proposalStreamDoc.commitId.toString()
            console.log('Proposal commitID', proposalCommmitID)
            console.log(
                'Second last CommitID:',
                proposalStreamDoc.allCommitIds[
                    proposalStreamDoc.allCommitIds.length - 2
                ].toString()
            )
            console.log(
                'Last CommitID:',
                proposalStreamDoc.allCommitIds[
                    proposalStreamDoc.allCommitIds.length - 1
                ].toString()
            )

            if (!updatedReceivedProposals[proposalStreamID]) {
                updatedReceivedProposals[proposalStreamID] = [
                    {
                        proposalCommitID: proposalCommmitID,
                    },
                ]
            } else {
                updatedReceivedProposals[proposalStreamID].push({
                    proposalCommitID: proposalCommmitID,
                })
            }
            console.log(
                'Registering new Proposal Submission',
                templateStreamDoc
            )
            await templateStreamDoc.update({
                ...templateStreamDoc.content,
                receivedProposals: updatedReceivedProposals,
            })
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    /***
     * Pushes templateStreamID to recents as singleton. Removes pre-existent entry therefore keeps chronological order.
     *
     * @param templateStreamID templateStreamID
     */
    addRecentTemplate = async (templateStreamID: string) => {
        try {
            const templateLib = await this.loadTemplateLib()
            const updatedTemplateLibContent = { ...templateLib.content }
            await templateLib.update({
                ...updatedTemplateLibContent,
                recents: pushUnique(
                    templateStreamID,
                    updatedTemplateLibContent.recents
                ),
            })
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    /**
     * Removes template from template-lib doc and sets isActive flag to false.
     *
     * @param tag Template Title / Unique tag
     * @auth Done by Templater
     */
    archiveTemplate = async (tag: string) => {
        try {
            const templateLib = await this.loadTemplateLib()

            const updatedTemplateLib = {
                ...templateLib.content,
            }
            const templateDoc = await this.loadTemplateDoc(
                updatedTemplateLib.lib[tag]
            )

            if (!updatedTemplateLib.archive)
                updatedTemplateLib.archive = { lib: [] }

            if (!updatedTemplateLib.archive.lib)
                updatedTemplateLib.archive = {
                    ...updatedTemplateLib.archive,
                    lib: [],
                }

            updatedTemplateLib.archive.lib.push(updatedTemplateLib.lib[tag])

            delete updatedTemplateLib.lib[tag]

            await templateDoc.update({
                ...templateDoc.content,
                isActive: false,
            })
            await templateLib.update({
                ...updatedTemplateLib,
            })
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    /***
     * Adds template to template-lib doc and removes it from template archive.
     *
     * TODO Update title if exists
     * @auth Done by Templater
     */
    unarchiveTemplate = async (templateStreamID: string) => {
        try {
            const templateLib = await this.loadTemplateLib()

            const updatedTemplateLib = {
                ...templateLib.content,
            }

            const templateDoc = ceramicInstance(this.user).loadStream(
                templateStreamID
            ) as unknown as TileDocument<CeramicTemplateModel>

            updatedTemplateLib.lib[templateDoc.content.title] = templateStreamID

            const updatedTemplateArchive = [...updatedTemplateLib.archive.lib]

            await templateLib.update({
                ...updatedTemplateLib,
                archive: {
                    ...updatedTemplateLib.archive,
                    lib: updatedTemplateArchive.filter(
                        (t) => t !== templateStreamID
                    ),
                },
            })
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }
}
