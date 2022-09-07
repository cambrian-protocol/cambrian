import { CAMBRIAN_LIB_NAME, ceramicInstance, createStage } from './CeramicUtils'
import {
    CeramicTemplateModel,
    ReceivedProposalPropsType,
    ReceivedProposalsHashmapType,
} from '../../models/TemplateModel'
import { StageLibType, StageNames } from '../../models/StageModel'

import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { FlexInputFormType } from '@cambrian/app/ui/templates/forms/TemplateFlexInputsForm'
import { GENERAL_ERROR } from '../../constants/ErrorMessages'
import { ProposalDocsStackType } from '@cambrian/app/store/ProposalContext'
import { TRILOBOT_ENDPOINT } from './../../../config/index'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '@cambrian/app/store/UserContext'
import _ from 'lodash'
import { cpLogger } from '../api/Logger.api'
import { deploySolutionBase } from '@cambrian/app/utils/helpers/proposalHelper'
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
     * Hits mailbox server and sets requestChange flag in the template.receivedProposals to true
     *
     * @param proposalStack ReadOnly ProposalStack
     * @auth must be done by the Templater
     */
    requestProposalChange = async (proposalStack: ProposalDocsStackType) => {
        try {
            // Hit mailbox server
            const res = await fetch(`${TRILOBOT_ENDPOINT}/requestChange`, {
                method: 'POST',
                body: JSON.stringify({
                    id: proposalStack.proposalDoc.id.toString(),
                    session: this.user.session.serialize(),
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (res.status === 200) {
                await this.updateProposalEntry(proposalStack.proposalDoc, {
                    requestChange: true,
                })
                return true
            } else {
                cpLogger.push(res.status)
                return false
            }
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    /**
     * Deploys a SolutionBase from the ProposalCommitID and the TemplateCommitID, hits mailbox server and sets the approved flag in the template.receivedProposals to true
     *
     * @param currentUser
     * @param proposalStack ReadOnly ProposalStack
     * @auth must be done by the Templater
     */
    approveProposal = async (
        currentUser: UserType,
        proposalStack: ProposalDocsStackType
    ) => {
        try {
            if (await deploySolutionBase(currentUser, proposalStack)) {
                // Hit mailbox server
                const res = await fetch(
                    `${TRILOBOT_ENDPOINT}/approveProposal`,
                    {
                        method: 'POST',
                        body: JSON.stringify({
                            id: proposalStack.proposalDoc.id.toString(),
                            session: this.user.session.serialize(),
                        }),
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                )
                if (res.status === 200) {
                    await this.updateProposalEntry(proposalStack.proposalDoc, {
                        approved: true,
                    })
                    return true
                } else {
                    cpLogger.push(res.status)
                    return false
                }
            }
        } catch (e) {
            throw e
        }
    }

    /**
     * Updates the templates receivedProposals[proposalStreamID] commit-entry.
     *
     * @auth Must be done by the templater
     */
    updateProposalEntry = async (
        proposalDoc: TileDocument<CeramicProposalModel>,
        updatedProposalEntry: ReceivedProposalPropsType
    ) => {
        const templateDoc = (await ceramicInstance(this.user).loadStream(
            proposalDoc.content.template.streamID
        )) as TileDocument<CeramicTemplateModel>

        const updatedReceivedProposals = _.cloneDeep(
            templateDoc.content.receivedProposals
        )

        const proposalSubmissions =
            updatedReceivedProposals[proposalDoc.id.toString()]
        if (!proposalSubmissions || proposalSubmissions.length === 0)
            throw Error('No Submissions found for provided Proposal StreamID.')

        // Doesn't hurt checking
        if (
            !proposalSubmissions[proposalSubmissions.length - 1] ||
            proposalSubmissions[proposalSubmissions.length - 1]
                .proposalCommitID !== proposalDoc.commitId.toString()
        )
            throw Error(
                'Provided Proposal commitID does not match with the most recent submission.'
            )

        proposalSubmissions[proposalSubmissions.length - 1] = {
            proposalCommitID: proposalDoc.commitId.toString(),
            ...updatedProposalEntry,
        }
        await templateDoc.update({
            ...templateDoc.content,
            receivedProposals: updatedReceivedProposals,
        })
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

            const proposalCommmitID = proposalStreamDoc.commitId.toString()
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
