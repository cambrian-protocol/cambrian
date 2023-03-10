import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { DocumentModel } from '@cambrian/app/services/api/cambrian.api'
import { ProposalModel } from './../../models/ProposalModel'
import { TemplateModel } from '../../models/TemplateModel'
import TemplateService from '@cambrian/app/services/stages/TemplateService'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { UserType } from '@cambrian/app/store/UserContext'
import _ from 'lodash'
import { checkAuthorization } from '@cambrian/app/utils/auth.utils'

export default class Template {
    private _auth?: UserType | null
    private _compositionDoc: DocumentModel<CompositionModel>
    private _templateDoc: DocumentModel<TemplateModel>
    private _templateService: TemplateService
    private _denominationToken: TokenModel


    constructor(compositionDoc: DocumentModel<CompositionModel>, templateDoc: DocumentModel<TemplateModel>, denominationToken: TokenModel, templateService: TemplateService, auth?: UserType | null,) {
        this._auth = auth
        this._templateDoc = templateDoc
        this._compositionDoc = compositionDoc
        this._templateService = templateService
        this._denominationToken = denominationToken
    }

    public get content(): TemplateModel {
        return this._templateDoc.content
    }

    public get doc(): DocumentModel<TemplateModel> {
        return this._templateDoc
    }

    public get compositionDoc(): DocumentModel<CompositionModel> {
        return this._compositionDoc
    }

    public get denominationToken(): TokenModel {
        return this._denominationToken
    }

    public async create(compositionStreamID: string, templateTitle: string) {
        if (!this._auth || !checkAuthorization(this._auth, this._templateDoc)) {
            return
        }

        try {
            await this._templateService.create(this._auth, compositionStreamID, templateTitle)
        } catch (e) {
            console.error(e)
        }
    }

    public async updateContent(updatedTemplate: TemplateModel) {
        if (!this._auth || !checkAuthorization(this._auth, this._templateDoc)) {
            return
        }
        try {
            const uniqueTitle = await this._templateService.update(this._auth, this._templateDoc, updatedTemplate)
            if (!uniqueTitle) throw new Error('Failed to updated Template')

            if (updatedTemplate.price.denominationTokenAddress !== this._denominationToken.address) {

                const newToken = await this._templateService.fetchToken(updatedTemplate.price.denominationTokenAddress)

                if (!newToken) throw new Error('Failed to fetch denominationToken')

                this._denominationToken = newToken
            }

            this._templateDoc.content = { ...updatedTemplate, title: uniqueTitle }
        } catch (e) {
            console.error(e)
        }
    }

    public async publish() {
        if (!this._auth || !checkAuthorization(this._auth, this._templateDoc)) {
            return
        }

        const _updatedTemplate = { ...this._templateDoc.content, isActive: true }

        try {
            await this._templateService.update(this._auth, this._templateDoc, _updatedTemplate)
            this._templateDoc.content = _updatedTemplate
        } catch (e) {
            console.error(e)
        }
    }

    public async unpublish() {
        if (!this._auth || !checkAuthorization(this._auth, this._templateDoc)) {
            return
        }

        const _updatedTemplate = { ...this._templateDoc.content, isActive: false }

        try {
            await this._templateService.update(this._auth, this._templateDoc, _updatedTemplate)
            this._templateDoc.content = _updatedTemplate
        } catch (e) {
            console.error(e)
        }
    }

    public async archive() {
        if (!this._auth || !checkAuthorization(this._auth, this._templateDoc)) {
            return
        }

        const _updatedTemplate = { ...this._templateDoc.content, isActive: false }

        try {
            await this._templateService.update(this._auth, this._templateDoc, _updatedTemplate)
            await this._templateService.archive(this._auth, this._templateDoc.streamID)
            this._templateDoc.content = _updatedTemplate
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
        const _updatedTemplate = { ...this._templateDoc.content }
        const updatedReceivedProposals = _updatedTemplate.receivedProposals
        const streamID = proposalDoc.streamID
        const commitID = proposalDoc.commitID

        if (updatedReceivedProposals[streamID]) {
            updatedReceivedProposals[streamID].push({ proposalCommitID: commitID })
        } else {
            updatedReceivedProposals[streamID] = [{ proposalCommitID: commitID }]
        }

        try {
            await this._templateService.update(this._auth, this._templateDoc, _updatedTemplate)
            await this._templateService.receive(this._auth, proposalDoc.streamID)
            this._templateDoc.content = _updatedTemplate
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
        const _updatedTemplate = { ...this._templateDoc.content }
        const streamID = proposalDoc.streamID
        const receivedProposals = _updatedTemplate.receivedProposals
        const latestProposalCommit = receivedProposals[streamID]?.slice(-1)[0]

        if (!this.isProposalsLatestVersion(proposalDoc)) {
            return
        }

        receivedProposals[streamID][receivedProposals[streamID].length - 1] = {
            ...latestProposalCommit,
            approved: true
        }

        try {
            await this._templateService.update(this._auth, this._templateDoc, _updatedTemplate)
            await this._templateService.approve(this._auth, proposalDoc.streamID)
            this._templateDoc.content = _updatedTemplate
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
        const _updatedTemplate = { ...this._templateDoc.content }
        const streamID = proposalDoc.streamID
        const receivedProposals = _updatedTemplate.receivedProposals
        const latestProposalCommit = receivedProposals[streamID]?.slice(-1)[0]

        if (!this.isProposalsLatestVersion(proposalDoc)) {
            return
        }

        receivedProposals[streamID][receivedProposals[streamID].length - 1] = {
            ...latestProposalCommit,
            isDeclined: true
        }

        try {
            await this._templateService.update(this._auth, this._templateDoc, _updatedTemplate)
            await this._templateService.decline(this._auth, proposalDoc.streamID)
            this._templateDoc.content = _updatedTemplate
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

        const _updatedTemplate = { ...this._templateDoc.content }
        const streamID = proposalDoc.streamID
        const receivedProposals = _updatedTemplate.receivedProposals
        const latestProposalCommit = receivedProposals[streamID]?.slice(-1)[0]

        if (!this.isProposalsLatestVersion(proposalDoc)) {
            return
        }

        receivedProposals[streamID][receivedProposals[streamID].length - 1] = {
            ...latestProposalCommit,
            requestChange: true
        }

        try {
            await this._templateService.update(this._auth, this._templateDoc, _updatedTemplate)
            await this._templateService.requestChange(this._auth, proposalDoc.streamID)
            this._templateDoc.content = _updatedTemplate
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
