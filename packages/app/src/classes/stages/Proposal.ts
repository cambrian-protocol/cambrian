import { ReceivedProposalsHashmapType, TemplateModel } from '../../models/TemplateModel'

import { DocumentModel } from '@cambrian/app/services/api/cambrian.api'
import { ProposalModel } from '../../models/ProposalModel'
import ProposalService from '@cambrian/app/services/ProposalService'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import Template from './Template'
import { UserType } from '@cambrian/app/store/UserContext'

export default class Proposal {
    private _auth?: UserType
    private _proposalDoc: DocumentModel<ProposalModel>
    private _template: Template
    private _status: ProposalStatus
    private _proposalService: ProposalService


    constructor(
        templateStreamDoc: DocumentModel<TemplateModel>,
        proposalDoc: DocumentModel<ProposalModel>,
        proposalService: ProposalService,
        auth?: UserType,
    ) {
        this._auth = auth
        this._proposalService = proposalService
        this._proposalDoc = proposalDoc
        this._template = new Template(templateStreamDoc, auth)
        this._status = this.getProposalStatus(templateStreamDoc, proposalDoc)

    }

    public get content(): ProposalModel {
        return this._proposalDoc.content
    }

    public get doc(): DocumentModel<ProposalModel> {
        return this._proposalDoc
    }

    public get templateDoc(): DocumentModel<TemplateModel> {
        return this._template.doc
    }

    public get status(): ProposalStatus {
        return this._status
    }

    public create() {
        // TODO
    }

    public updateDocs(updatedProposalDoc: DocumentModel<ProposalModel>, updatedTemplateDoc?: DocumentModel<TemplateModel>) {
        this._proposalDoc = updatedProposalDoc
        if (updatedTemplateDoc) this._template.updateDoc(updatedTemplateDoc)
        this._status = this.getProposalStatus(updatedTemplateDoc || this.templateDoc, updatedProposalDoc)
    }

    public updateContent(updatedProposal: ProposalModel,) {
        if (!this._auth || this._auth.did !== this._proposalDoc.content.author) {
            console.error('Unauthorized!')
            return
        }

        const isStatusValid = [
            ProposalStatus.Draft,
            ProposalStatus.ChangeRequested,
            ProposalStatus.Modified,
        ].includes(this._status)

        if (!isStatusValid) {
            console.error('Invalid status!')
            return
        }

        this._proposalDoc.content = updatedProposal

        if (this._status === ProposalStatus.ChangeRequested) {
            this._status = ProposalStatus.Modified
        }
    }

    public async receiveChangeRequest() {
        if (!this._auth || this._auth.did !== this._proposalDoc.content.author) {
            console.error('Unauthorized!')
            return
        }

        this._proposalDoc.content.isSubmitted = false
        await this._proposalService.saveProposal(this._auth, this._proposalDoc)
    }

    public requestChange() {
        if (!this._auth || this._auth.did !== this._template.content.author) {
            console.error('Unauthorized!')
            return
        }

        try {
            this._template.requestChange(this._proposalDoc)
            this._status = ProposalStatus.ChangeRequested
        } catch (e) {
            console.error(e)
        }
    }

    public receive() {
        if (!this._auth || this._auth.did !== this._template.content.author) {
            console.error('Unauthorized!')
            return
        }

        try {
            this._template.receive(this._proposalDoc)
        } catch (e) {
            console.error(e)
        }
    }

    public submit() {
        if (!this._auth || this._auth.did !== this._proposalDoc.content.author) {
            console.error('Unauthorized!')
            return
        }

        if (this._proposalDoc.content.isSubmitted) {
            console.error('Proposal already submitted!')
            return
        }

        const isStatusValid = [
            ProposalStatus.Draft,
            ProposalStatus.Modified,
        ].includes(this._status)

        if (!isStatusValid) {
            console.error('Invalid status!')
            return
        }

        this._proposalDoc.content.isSubmitted = true
        this._status = ProposalStatus.OnReview
    }

    // TODO Write tests
    private getProposalStatus(templateDoc: DocumentModel<TemplateModel>, proposalDoc: DocumentModel<ProposalModel>, onChainProposal?: any): ProposalStatus {
        if (onChainProposal && onChainProposal.isExecuted) {
            return ProposalStatus.Executed
        } else if (onChainProposal) {
            return ProposalStatus.Funding
        }

        const receivedProposals = templateDoc.content.receivedProposals

        const approvedProposalCommitID = this.getApprovedProposalCommitID(receivedProposals)
        if (approvedProposalCommitID) {
            return ProposalStatus.Approved
        }

        if (proposalDoc.content.isCanceled) {
            return ProposalStatus.Canceled
        }

        const receivedProposalCommits = receivedProposals[proposalDoc.streamID]

        if (receivedProposalCommits) {
            const proposalCommit = receivedProposalCommits[receivedProposalCommits.length - 1]

            if (proposalCommit.isDeclined) {
                return ProposalStatus.Canceled
            } else if (proposalCommit.approved) {
                return ProposalStatus.Approved
            } else if (proposalCommit.requestChange) {
                return ProposalStatus.ChangeRequested
            } else {
                return ProposalStatus.OnReview
            }
        }

        if (proposalDoc.content.isSubmitted) {
            return ProposalStatus.OnReview
        }

        return ProposalStatus.Draft
    }

    private getApprovedProposalCommitID = (receivedProposals: ReceivedProposalsHashmapType
    ) => {
        return (receivedProposals &&
            receivedProposals[this._proposalDoc.streamID]?.find(
                (commit) => commit.approved
            )?.proposalCommitID) ||
            undefined
    }


}
