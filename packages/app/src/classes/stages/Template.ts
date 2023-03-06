import { DocumentModel } from '@cambrian/app/services/api/cambrian.api'
import { ProposalModel } from './../../models/ProposalModel'
import { TemplateModel } from '../../models/TemplateModel'
import TemplateService from '@cambrian/app/services/stages/TemplateService'
import { UserType } from '@cambrian/app/store/UserContext'
import _ from 'lodash'
import { checkAuthorization } from '@cambrian/app/utils/auth.utils'

export default class Template {
    private _auth?: UserType | null
    private _templateDoc: DocumentModel<TemplateModel>
    private _templateService: TemplateService


    constructor(templateDoc: DocumentModel<TemplateModel>, templateService: TemplateService, auth?: UserType | null,) {
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
        if (!this._auth || !checkAuthorization(this._auth, this._templateDoc)) {
            return
        }

        try {
            await this._templateService.create(this._auth, this._templateDoc.content)
        } catch (e) {
            console.error(e)
        }
    }

    public async updateContent(updatedTemplate: TemplateModel) {
        if (!this._auth || !checkAuthorization(this._auth, this._templateDoc)) {
            return
        }

        this._templateDoc.content = updatedTemplate

        try {
            await this._templateService.save(this._auth, this._templateDoc)
        } catch (e) {
            console.error(e)
        }
    }

    public async publish() {
        if (!this._auth || !checkAuthorization(this._auth, this._templateDoc)) {
            return
        }

        this._templateDoc.content.isActive = true

        try {
            await this._templateService.save(this._auth, this._templateDoc)
        } catch (e) {
            console.error(e)
        }
    }

    public async unpublish() {
        if (!this._auth || !checkAuthorization(this._auth, this._templateDoc)) {
            return
        }

        this._templateDoc.content.isActive = false

        try {
            await this._templateService.save(this._auth, this._templateDoc)
        } catch (e) {
            console.error(e)
        }
    }

    public async archive() {
        if (!this._auth || !checkAuthorization(this._auth, this._templateDoc)) {
            return
        }

        this._templateDoc.content.isActive = false

        try {
            await this._templateService.save(this._auth, this._templateDoc)
            await this._templateService.archive(this._auth, this._templateDoc.streamID)
        } catch (e) {
            console.error(e)
        }
    }

    public async archiveReceivedProposal(proposalStreamId: string) {
        if (!this._auth || !checkAuthorization(this._auth, this._templateDoc)) {
            return
        }

        try {
            await this._templateService.archiveReceivedProposal(this._auth, proposalStreamId)
        } catch (e) {
            console.error(e)
        }
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
            await this._templateService.receive(this._auth, proposalDoc.streamID)
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
            await this._templateService.approve(this._auth, proposalDoc.streamID)
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
        const latestProposalCommit = receivedProposals[streamID]?.slice(-1)[0]

        if (!this.isProposalsLatestVersion(proposalDoc)) {
            return
        }

        receivedProposals[streamID][receivedProposals[streamID].length - 1] = {
            ...latestProposalCommit,
            isDeclined: true
        }

        try {
            await this._templateService.save(this._auth, this._templateDoc)
            await this._templateService.decline(this._auth, proposalDoc.streamID)
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
        const latestProposalCommit = receivedProposals[streamID]?.slice(-1)[0]

        if (!this.isProposalsLatestVersion(proposalDoc)) {
            return
        }

        receivedProposals[streamID][receivedProposals[streamID].length - 1] = {
            ...latestProposalCommit,
            requestChange: true
        }

        try {
            await this._templateService.save(this._auth, this._templateDoc)
            await this._templateService.requestChange(this._auth, proposalDoc.streamID)
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

}
