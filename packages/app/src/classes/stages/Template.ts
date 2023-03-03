import { DocumentModel } from '@cambrian/app/services/api/cambrian.api'
import { ProposalModel } from './../../models/ProposalModel'
import { TemplateModel } from '../../models/TemplateModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { checkAuthorization } from '@cambrian/app/utils/auth.utils'

export default class Template {
    private _auth?: UserType
    private _templateDoc: DocumentModel<TemplateModel>


    constructor(templateDoc: DocumentModel<TemplateModel>, auth?: UserType,) {
        this._auth = auth
        this._templateDoc = templateDoc
    }

    public get content(): TemplateModel {
        return this._templateDoc.content
    }

    public get doc(): DocumentModel<TemplateModel> {
        return this._templateDoc
    }

    public async create() { }

    public refreshDoc(updatedTemplateDoc: DocumentModel<TemplateModel>) {
        this._templateDoc = updatedTemplateDoc
    }

    public receive(proposalDoc: DocumentModel<ProposalModel>) {
        if (!this._auth || !checkAuthorization(this._auth, this._templateDoc)) {
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

    public requestChange(proposalDoc: DocumentModel<ProposalModel>) {
        if (!this._auth || !checkAuthorization(this._auth, this._templateDoc)) {
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

    public async approve(proposalDoc: DocumentModel<ProposalModel>) {
        if (!this._auth || !checkAuthorization(this._auth, this._templateDoc)) {
            return
        }

        if (!proposalDoc.content.isSubmitted) {
            return
        }

        const streamID = proposalDoc.streamID
        const receivedProposals = this._templateDoc.content.receivedProposals
        const latestProposalCommit = receivedProposals[streamID]?.[receivedProposals[streamID].length - 1]

        // This check can fail when CAS rolled out new commitIds. Maybe there is a way to check if the freshly rolled-out commitId has the not-anchored commit as a parent? So we can really be sure that the templater and proposer have agreed. Fetching the content and comparing at least?

        /* if (!latestProposalCommit || proposalDoc.commitID !== latestProposalCommit.proposalCommitID) {
            console.error('Provided proposalCommitID does not match with latest received commitID!')
            return
        } */

        receivedProposals[streamID][receivedProposals[streamID].length - 1] = {
            ...latestProposalCommit,
            approved: true
        }
    }

    // Former toggleActivate
    public async publish() { }

    // Former toggleActivate
    public async unpublish() { }

    public async archive() { }
}
