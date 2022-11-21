import {
    ReceivedProposalPropsType,
    ReceivedProposalsHashmapType,
    TemplateModel,
} from '../../models/TemplateModel'
import {
    archiveStage,
    ceramicInstance,
    createStage,
    loadCommitWorkaround,
    loadStageDoc,
    loadStagesLib,
    loadStageStackFromID,
} from './CeramicUtils'

import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { FlexInputFormType } from '@cambrian/app/ui/templates/forms/TemplateFlexInputsForm'
import { GENERAL_ERROR } from '../../constants/ErrorMessages'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { StageNames } from '../../models/StageModel'
import { StageStackType } from '@cambrian/app/ui/dashboard/ProposalsDashboardUI'
import { TRILOBOT_ENDPOINT } from './../../../config/index'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '@cambrian/app/store/UserContext'
import _ from 'lodash'
import { cpLogger } from '../api/Logger.api'
import { createSolutionBase } from '@cambrian/app/utils/helpers/proposalHelper'
import { SlotTagModel } from '@cambrian/app/models/SlotTagModel'
import { SolverConfigModel } from '@cambrian/app/models/SolverConfigModel'

/** 
 API functions to maintain templates and the users template-lib
*/
export default class CeramicTemplateAPI {
    user: UserType

    constructor(currentUser: UserType) {
        this.user = currentUser
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
                    if (solver.slotTags[tagId].isFlex !== 'None') {
                        if (tagId === 'collateralToken') {
                            isCollateralFlex = true
                        } else {
                            formFlexInputs.push({
                                ...(solver.slotTags[tagId] as SlotTagModel),
                                tagId: tagId,
                                value:
                                    tagId === 'timelockSeconds'
                                        ? solver.config.timelockSeconds?.toString() ||
                                          ''
                                        : '', // TODO this is stupid
                            })
                            formFlexInputs.push()
                        }
                    }
                })
            })

            const template: TemplateModel = {
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
                isActive: true,
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
     * @param stageStack
     * @auth must be done by the Templater
     */
    requestProposalChange = async (stageStack: StageStackType) => {
        try {
            // Hit mailbox server
            const res = await fetch(`${TRILOBOT_ENDPOINT}/requestChange`, {
                method: 'POST',
                body: JSON.stringify({
                    id: stageStack.proposalStreamID,
                    session: this.user.session.serialize(),
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (res.status === 200) {
                await this.updateProposalEntry(stageStack, {
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
     * @param stageStack
     * @auth must be done by the Templater
     */
    approveProposal = async (stageStack: StageStackType) => {
        try {
            // Hit mailbox server
            const res = await fetch(`${TRILOBOT_ENDPOINT}/approveProposal`, {
                method: 'POST',
                body: JSON.stringify({
                    id: stageStack.proposalStreamID,
                    session: this.user.session.serialize(),
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            if (res.status === 200) {
                await this.updateProposalEntry(stageStack, {
                    approved: true,
                })
                return await createSolutionBase(this.user, stageStack)
            } else {
                cpLogger.push(res.status)
                return false
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
        stageStack: StageStackType,
        updatedProposalEntry: ReceivedProposalPropsType
    ) => {
        const templateDoc = (await ceramicInstance(this.user).loadStream(
            stageStack.proposal.template.streamID
        )) as TileDocument<TemplateModel>

        const updatedReceivedProposals = _.cloneDeep(
            templateDoc.content.receivedProposals
        )

        const proposalSubmissions =
            updatedReceivedProposals[stageStack.proposalStreamID]
        if (!proposalSubmissions || proposalSubmissions.length === 0)
            throw Error('No Submissions found for provided Proposal StreamID.')

        if (
            !proposalSubmissions[proposalSubmissions.length - 1] ||
            !_.isEqual(
                <ProposalModel>(
                    (
                        await loadCommitWorkaround(
                            proposalSubmissions[proposalSubmissions.length - 1]
                                .proposalCommitID
                        )
                    ).content
                ),
                stageStack.proposal
            )
        )
            throw Error(
                'Provided Proposal commit does not match with the most recent submission.'
            )

        proposalSubmissions[proposalSubmissions.length - 1] = {
            proposalCommitID: stageStack.proposalCommitID,
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
    registerNewProposalSubmission = async (stageStack: StageStackType) => {
        try {
            const cs = ceramicInstance(this.user)
            const templateStreamDoc = (await cs.loadStream(
                stageStack.proposal.template.streamID
            )) as TileDocument<TemplateModel>

            let updatedReceivedProposals: ReceivedProposalsHashmapType = {}
            if (templateStreamDoc.content.receivedProposals) {
                updatedReceivedProposals = _.cloneDeep(
                    templateStreamDoc.content.receivedProposals
                )
            }

            const registeredProposalEntry =
                updatedReceivedProposals[stageStack.proposalStreamID]

            if (!registeredProposalEntry) {
                // Entirely new proposal submission
                updatedReceivedProposals[stageStack.proposalStreamID] = [
                    {
                        proposalCommitID: stageStack.proposalCommitID,
                    },
                ]

                await templateStreamDoc.update({
                    ...templateStreamDoc.content,
                    receivedProposals: updatedReceivedProposals,
                })
            } else {
                const latestRegisteredCommitID =
                    registeredProposalEntry[registeredProposalEntry.length - 1]
                        .proposalCommitID

                const latestProposalCommitContent = <ProposalModel>(
                    (await loadCommitWorkaround(latestRegisteredCommitID))
                        .content
                )

                // No duplicate and proposal must have changed
                if (
                    updatedReceivedProposals[
                        stageStack.proposalStreamID
                    ].findIndex(
                        (e) =>
                            e.proposalCommitID === stageStack.proposalCommitID
                    ) === -1 &&
                    !_.isEqual(latestProposalCommitContent, stageStack.proposal)
                ) {
                    updatedReceivedProposals[stageStack.proposalStreamID].push({
                        proposalCommitID: stageStack.proposalCommitID,
                    })

                    await templateStreamDoc.update({
                        ...templateStreamDoc.content,
                        receivedProposals: updatedReceivedProposals,
                    })
                }
            }
            return updatedReceivedProposals
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    toggleActivate = async (templateStreamID: string) => {
        try {
            const templateStreamDoc = await loadStageDoc<TemplateModel>(
                this.user,
                templateStreamID
            )

            await templateStreamDoc.update({
                ...templateStreamDoc.content,
                isActive: !templateStreamDoc.content.isActive,
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
    archiveTemplate = async (tag: string, templateStreamID: string) => {
        try {
            const templateStreamDoc = await loadStageDoc<TemplateModel>(
                this.user,
                templateStreamID
            )
            await templateStreamDoc.update({
                ...templateStreamDoc.content,
                isActive: false,
            })

            await archiveStage(this.user, tag, StageNames.template)
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
        /*    try {
            const templateLib = await loadStageLib<StageLibType>(
                this.user,
                StageNames.template
            )

            const updatedTemplateLib = {
                ...templateLib.content,
            }

            const templateDoc = ceramicInstance(this.user).loadStream(
                templateStreamID
            ) as unknown as TileDocument<TemplateModel>

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
        } */
    }

    removeReceivedProposal = async (
        proposalStreamID: string,
        type: 'DECLINE' | 'ARCHIVE'
    ) => {
        try {
            const stagesLib = await loadStagesLib(this.user)

            const updatedStagesLib = {
                ...stagesLib.content,
            }

            const stageStack = await loadStageStackFromID(proposalStreamID)
            // Set isDeclined if proposal is before approved
            if (type === 'DECLINE') {
                await this.updateProposalEntry(stageStack, { isDeclined: true })
            }

            updatedStagesLib.templates.archive.receivedProposals[
                stageStack.proposal.title
            ] = proposalStreamID

            await stagesLib.update(updatedStagesLib)
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }
}
