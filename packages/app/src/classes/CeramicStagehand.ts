import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { FlexInputFormType } from '../ui/templates/forms/TemplateFlexInputsForm'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import { SelfID } from '@self.id/framework'
import { StringHashmap } from '@cambrian/app/models/UtilityModels'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { cpLogger } from '../services/api/Logger.api'
import initialComposer from '../store/composer/composer.init'

export enum StageNames {
    composition = 'composition',
    template = 'template',
    proposal = 'proposal',
}

type StageModel = CompositionModel | CeramicTemplateModel | CeramicProposalModel

export type Stages = {
    [key in StageNames]: StageModel
}

const CAMBRIAN_LIB_NAME = 'cambrian-lib'

export default class CeramicStagehand {
    selfID: SelfID

    constructor(selfID: SelfID) {
        this.selfID = selfID
    }

    // TODO
    isStageSchema = (data: StageModel, stage: StageNames) => {
        return true
    }

    updateStage = async (
        streamID: string,
        data: StageModel,
        stage: StageNames
    ) => {
        if (!this.isStageSchema(data, stage)) {
            throw GENERAL_ERROR['WRONG_SCHEMA']
        }

        const currentData: TileDocument<StageModel> = await TileDocument.load(
            this.selfID.client.ceramic,
            streamID
        )

        const cleanedUserTitle = data.title.trim()

        if (currentData.content.title !== cleanedUserTitle) {
            // StageLib and Meta Tag must be updated
            const stageLib = await TileDocument.deterministic(
                this.selfID.client.ceramic,
                {
                    controllers: [this.selfID.id],
                    family: CAMBRIAN_LIB_NAME,
                    tags: [stage],
                },
                { pin: true }
            )

            const stages = stageLib.content as StringHashmap

            const currentTag = Object.keys(stages).find(
                (tag) => stages[tag] === streamID
            )
            if (!currentTag) throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']

            const updatedStageLib = {
                ...(stageLib.content as StringHashmap),
            }
            // Attach counter to tag in case it exists already
            let uniqueTag = cleanedUserTitle
            let counter = 1
            while (updatedStageLib[uniqueTag]) {
                uniqueTag = cleanedUserTitle + ` (${counter++})`
            }
            updatedStageLib[uniqueTag] = streamID
            delete updatedStageLib[currentTag]

            await stageLib.update(updatedStageLib)
            await currentData.update(
                { ...data, title: uniqueTag },
                { ...currentData.metadata, tags: [uniqueTag] }
            )
            return { uniqueTag: uniqueTag }
        } else {
            await currentData.update({ ...data, title: cleanedUserTitle })
            return { uniqueTag: cleanedUserTitle }
        }
    }

    createStage = async (tag: string, data: StageModel, stage: StageNames) => {
        if (!this.isStageSchema(data, stage)) {
            throw GENERAL_ERROR['WRONG_SCHEMA']
        }

        try {
            const stageLib = await TileDocument.deterministic(
                this.selfID.client.ceramic,
                {
                    controllers: [this.selfID.id],
                    family: CAMBRIAN_LIB_NAME,
                    tags: [stage],
                },
                { pin: true }
            )

            let uniqueTag = tag
            if (
                stageLib.content !== null &&
                typeof stageLib.content === 'object'
            ) {
                const stages = {
                    ...(stageLib.content as StringHashmap),
                }
                // Attach counter to tag in case it exists already
                let counter = 1
                while (stages[uniqueTag]) {
                    uniqueTag = tag + ` (${counter++})`
                }
            }

            // Overwrite title if tag wasn't unique
            if (uniqueTag !== tag) {
                data = { ...data, title: uniqueTag }
            }

            const currentDoc = await TileDocument.deterministic(
                this.selfID.client.ceramic,
                {
                    controllers: [this.selfID.id],
                    family: `cambrian-${stage}`,
                    tags: [uniqueTag],
                }
            )
            await currentDoc.update(data)
            const streamID = currentDoc.id.toString()

            if (
                stageLib.content !== null &&
                typeof stageLib.content === 'object'
            ) {
                await stageLib.update({
                    ...stageLib.content,
                    [uniqueTag]: streamID,
                })
            } else {
                await stageLib.update({
                    [uniqueTag]: streamID,
                })
            }

            return { uniqueTag: uniqueTag, streamID: streamID }
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    createComposition = async (tag: string, composition?: CompositionModel) => {
        return await this.createStage(
            tag,
            composition
                ? composition
                : {
                      title: tag,
                      description: '',
                      flowElements: initialComposer.flowElements,
                      solvers: initialComposer.solvers,
                  },
            StageNames.composition
        )
    }

    createTemplate = async (tag: string, compositionStreamID: string) => {
        const composition: TileDocument<CompositionModel> =
            await TileDocument.load(
                this.selfID.client.ceramic,
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
            title: tag,
            description: '',
            requirements: '',
            price: {
                amount: 0,
                denominationTokenAddress:
                    composition.content.solvers[0].config.collateralToken || '',
                preferredTokens: [],
                allowAnyPaymentToken: false,
                isCollateralFlex: isCollateralFlex,
            },
            flexInputs: formFlexInputs,
            composition: {
                streamID: compositionStreamID,
                commitID: composition.commitId.toString(),
            },
            author: this.selfID.did.id.toString(),
        }

        return await this.createStage(tag, template, StageNames.template)
    }

    createProposal = async (tag: string, templateStreamID: string) => {
        const template: TileDocument<CeramicTemplateModel> =
            await TileDocument.load(
                this.selfID.client.ceramic,
                templateStreamID
            )

        const proposal: CeramicProposalModel = {
            title: tag,
            description: '',
            template: {
                streamID: templateStreamID,
                commitID: template.commitId.toString(),
            },
            flexInputs: template.content.flexInputs.filter(
                (flexInput) =>
                    flexInput.tagId !== 'collateralToken' &&
                    flexInput.value === ''
            ),
            authors: [template.content.author, this.selfID.did.id.toString()],
            price: {
                amount: 0,
                tokenAddress: template.content.price.denominationTokenAddress,
            },
            approved: false,
        }

        return await this.createStage(tag, proposal, StageNames.proposal)
    }

    loadStream = async (streamID: string) => {
        try {
            const doc = await TileDocument.load(
                this.selfID.client.ceramic,
                streamID
            )
            return doc
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']
        }
    }

    loadStages = async (stage: StageNames) => {
        try {
            const stageLib = await TileDocument.deterministic(
                this.selfID.client.ceramic,
                {
                    controllers: [this.selfID.id],
                    family: CAMBRIAN_LIB_NAME,
                    tags: [stage],
                },
                { pin: true }
            )

            return stageLib.content
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']
        }
    }

    deleteStage = async (streamKey: string, stage: StageNames) => {
        try {
            const stageCollection = await TileDocument.deterministic(
                this.selfID.client.ceramic,
                {
                    controllers: [this.selfID.id],
                    family: CAMBRIAN_LIB_NAME,
                    tags: [stage],
                },
                { pin: true }
            )
            if (
                stageCollection.content !== null &&
                typeof stageCollection.content === 'object'
            ) {
                const updatedStageLib: StringHashmap = {
                    ...stageCollection.content,
                }

                delete updatedStageLib[streamKey]
                stageCollection.update({
                    ...updatedStageLib,
                })
            }
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    sendProposal = async (proposalStreamID: string) => {
        try {
            // Hit mailbox server
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_TRILOBOT}/propose`,
                {
                    method: 'POST',
                    body: proposalStreamID,
                }
            )

            if (res.status === 200) {
                return true
            }
        } catch (e) {
            console.log(e)
        }
    }

    receiveProposal = async (proposalStreamID: string, selfID: SelfID) => {
        try {
            const proposal = await TileDocument.load(
                selfID.client.ceramic,
                proposalStreamID
            )

            if (proposal.content !== null) {
                const draftProposal = await TileDocument.deterministic(
                    selfID.client.ceramic,
                    {
                        controllers: [selfID.id],
                        family: 'cambrian-proposal',
                        tags: [proposalStreamID],
                    }
                )

                await draftProposal.update(proposal.content)
            }
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }
}
