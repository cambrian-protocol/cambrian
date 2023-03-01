import { DocumentModel } from '@cambrian/app/services/api/cambrian.api';
import { ProposalModel } from './../../models/ProposalModel';
import { TemplateModel } from '../../models/TemplateModel'

export default class Template {
    private _templateDoc: DocumentModel<TemplateModel>


    constructor(templateDoc: DocumentModel<TemplateModel>) {
        this._templateDoc = templateDoc
    }

    public get data(): TemplateModel {
        return this._templateDoc.content
    }

    public get doc(): DocumentModel<TemplateModel> {
        return this._templateDoc
    }

    public async create() { }

    public receive(authDid: string, proposalDoc: DocumentModel<ProposalModel>) {
        try {
            if (authDid !== this._templateDoc.content.author) throw new Error("Unauthorized!")

            if (proposalDoc.content.isSubmitted) {
                const receivedProposals = this._templateDoc.content.receivedProposals
                const streamID = proposalDoc.streamID
                const commitID = proposalDoc.commitID

                if (receivedProposals[streamID]) {
                    receivedProposals[streamID].push({ proposalCommitID: commitID })
                } else {
                    receivedProposals[streamID] = [{ proposalCommitID: commitID }]
                }
            }

        } catch (e) {
            console.error(e)
        }
    }

    public requestChange(authDid: string, proposalDoc: DocumentModel<ProposalModel>) {
        try {
            if (authDid !== this._templateDoc.content.author) throw new Error("Unauthorized!")
            if (proposalDoc.content.isSubmitted) {
                const streamID = proposalDoc.streamID
                const receivedProposals = this._templateDoc.content.receivedProposals
                const latestProposalCommit = receivedProposals[streamID][receivedProposals[streamID].length - 1]

                if (proposalDoc.commitID !== latestProposalCommit.proposalCommitID) throw new Error('Provided proposalCommitID does not match with latest received commitID!')

                receivedProposals[streamID][receivedProposals[streamID].length - 1] = {
                    ...receivedProposals[streamID][receivedProposals[streamID].length - 1], requestChange: true
                }
            }
        } catch (e) {
            console.error(e)
        }
    }

    // Former toggleActivate
    public async publish() { }

    // Former toggleActivate
    public async unpublish() { }

    public async archive() { }
}
