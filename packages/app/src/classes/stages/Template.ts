import { DocumentModel } from '@cambrian/app/services/api/cambrian.api'
import { ProposalModel } from './../../models/ProposalModel'
import { TemplateModel } from '../../models/TemplateModel'
import TemplateService from '@cambrian/app/services/TemplateService'
import { UserType } from '@cambrian/app/store/UserContext'
import _ from 'lodash'
import { checkAuthorization } from '@cambrian/app/utils/auth.utils'

export default class Template {
    private _auth?: UserType
    private _templateDoc: DocumentModel<TemplateModel>
    private _templateService: TemplateService


    constructor(templateDoc: DocumentModel<TemplateModel>, templateService: TemplateService, auth?: UserType,) {
        this._auth = auth
        this._templateDoc = templateDoc
        this._templateService = templateService
    }

    public get content(): TemplateModel {
        return this._templateDoc.content
    }

    public get doc(): DocumentModel<TemplateModel> {
        return this._templateDoc
    }

    public async create() {
        // TODO
    }

    public refreshDoc(updatedTemplateDoc: DocumentModel<TemplateModel>) {
        this._templateDoc = updatedTemplateDoc
    }

    public async receive(proposalDoc: DocumentModel<ProposalModel>) {
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

        try {
            await this._templateService.save(this._auth, this._templateDoc)
        } catch (e) {
            console.error(e)
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
        const latestProposalCommit = receivedProposals[streamID]?.slice(-1)[0]

        if (!this.isProposalsLatestVersion(proposalDoc)) {
            return
        }

        receivedProposals[streamID][receivedProposals[streamID].length - 1] = {
            ...latestProposalCommit,
            approved: true
        }

        try {
            await this._templateService.save(this._auth, this._templateDoc)
        } catch (e) {
            console.error(e)
        }
    }

    public async decline(proposalDoc: DocumentModel<ProposalModel>) {
        if (!this._auth || !checkAuthorization(this._auth, this._templateDoc)) {
            return
        }

        if (!proposalDoc.content.isSubmitted) {
            return
        }

        const streamID = proposalDoc.streamID
        const receivedProposals = this._templateDoc.content.receivedProposals
        const latestProposalCommit = receivedProposals[streamID]?.[receivedProposals[streamID].length - 1]

        if (!this.isProposalsLatestVersion(proposalDoc)) {
            return
        }

        receivedProposals[streamID][receivedProposals[streamID].length - 1] = {
            ...latestProposalCommit,
            isDeclined: true
        }

        try {
            await this._templateService.save(this._auth, this._templateDoc)
        } catch (e) {
            console.error(e)
        }
    }

    public async requestChange(proposalDoc: DocumentModel<ProposalModel>) {
        if (!this._auth || !checkAuthorization(this._auth, this._templateDoc)) {
            return
        }

        if (!proposalDoc.content.isSubmitted) {
            return
        }

        const streamID = proposalDoc.streamID
        const receivedProposals = this._templateDoc.content.receivedProposals
        const latestProposalCommit = receivedProposals[streamID]?.[receivedProposals[streamID].length - 1]

        if (!this.isProposalsLatestVersion(proposalDoc)) {
            return
        }

        receivedProposals[streamID][receivedProposals[streamID].length - 1] = {
            ...latestProposalCommit,
            requestChange: true
        }

        try {
            await this._templateService.save(this._auth, this._templateDoc)
        } catch (e) {
            console.error(e)
        }
    }

    private async isProposalsLatestVersion(proposalDoc: DocumentModel<ProposalModel>) {
        const streamID = proposalDoc.streamID
        const receivedProposals = this._templateDoc.content.receivedProposals
        const latestProposalCommit = receivedProposals[streamID]?.slice(-1)[0]

        if (latestProposalCommit?.proposalCommitID === proposalDoc.commitID) {
            return true
        }

        // CAS might have rolled out anchored commitIds. We compare the contents of the latest version.
        const latestProposalCommitDoc = await this._templateService.readProposalCommit(proposalDoc.streamID, latestProposalCommit.proposalCommitID)

        if (!_.isEqual(latestProposalCommitDoc?.content, proposalDoc.content)) {
            console.error('Proposal does not match with the latest registered version!')
            return false
        }
        return true
    }

    // Former toggleActivate
    public async publish() { }

    // Former toggleActivate
    public async unpublish() { }

    public async archive() { }
}
