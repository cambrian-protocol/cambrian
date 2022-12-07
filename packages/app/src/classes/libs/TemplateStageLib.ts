import BaseStageLib, {
    BaseStageLibType,
    defaultBaseStagesLib,
} from './BaseStageLib'

export type TemplateStagesLibType = BaseStageLibType & {
    archive: {
        receivedProposals: string[]
    }
}

export const defaultTemplateStagesLib: TemplateStagesLibType = {
    ...defaultBaseStagesLib,
    archive: { ...defaultBaseStagesLib.archive, receivedProposals: [] },
}

export default class TemplateStageLib extends BaseStageLib {
    protected _archive = defaultTemplateStagesLib.archive

    constructor(templateLib: TemplateStagesLibType) {
        super(templateLib)
        this.update(templateLib)
    }

    public override get archive() {
        return this._archive
    }

    public archiveReceivedProposal(proposalStreamID: string) {
        this._archive.receivedProposals.push(proposalStreamID)
    }

    public override update(templateLib: TemplateStagesLibType) {
        if (typeof templateLib.archive.receivedProposals === 'object') {
            const receivedProposalsArray: string[] = []
            if (Object.keys(templateLib.archive.receivedProposals).length > 0) {
                receivedProposalsArray.push(
                    ...Object.values(templateLib.archive.receivedProposals)
                )
            }

            this._archive = {
                ...templateLib.archive,
                receivedProposals: receivedProposalsArray,
            }
        } else {
            this._archive = { ...templateLib.archive }
        }
    }

    public override get lib(): TemplateStagesLibType {
        return {
            streamIDs: this._streamIDs,
            archive: this._archive,
        }
    }
}
