import { DocumentModel } from '@cambrian/app/services/api/cambrian.api'
import { ProposalModel } from './../../models/ProposalModel'
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
        if (authDid !== this._templateDoc.content.author) {
            console.error("Unauthorized!")
            return
        }

        if (!proposalDoc.content.isSubmitted) {
            return
        }

        const receivedProposals = this._templateDoc.content.receivedProposals
        const streamID = proposalDoc.streamID
        const commitID = proposalDoc.commitID

        if (receivedProposals[streamID]) {
            receivedProposals[streamID].push({ proposalCommitID: commitID })
        } else {
            receivedProposals[streamID] = [{ proposalCommitID: commitID }]
        }

    }

    public requestChange(authDid: string, proposalDoc: DocumentModel<ProposalModel>) {
        if (authDid !== this._templateDoc.content.author) {
            console.error("Unauthorized!")
            return
        }

        if (!proposalDoc.content.isSubmitted) {
            return
        }

        const streamID = proposalDoc.streamID
        const receivedProposals = this._templateDoc.content.receivedProposals
        const latestProposalCommit = receivedProposals[streamID]?.[receivedProposals[streamID].length - 1]

        if (!latestProposalCommit || proposalDoc.commitID !== latestProposalCommit.proposalCommitID) {
            console.error('Provided proposalCommitID does not match with latest received commitID!')
            return
        }

        receivedProposals[streamID][receivedProposals[streamID].length - 1] = {
            ...latestProposalCommit,
            requestChange: true
        }
    }

    // Former toggleActivate
    public async publish() { }

    // Former toggleActivate
    public async unpublish() { }

    public async archive() { }
}
