import { ReceivedProposalsHashmapType, TemplateModel } from '../../models/TemplateModel'

import { DocumentModel } from '@cambrian/app/services/api/cambrian.api'
import { ProposalModel } from '../../models/ProposalModel'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import Template from './Template'

export default class Proposal {
    private _proposalDoc: DocumentModel<ProposalModel>
    private _template: Template
    private _status: ProposalStatus


    constructor(templateStreamDoc: DocumentModel<TemplateModel>, proposalDoc: DocumentModel<ProposalModel>,) {
        this._proposalDoc = proposalDoc
        this._template = new Template(templateStreamDoc)
        this._status = this.getProposalStatus(templateStreamDoc, proposalDoc)

    }

    public get data(): ProposalModel {
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

    public updateContent(authDid: string, updatedProposal: ProposalModel) {
        if (authDid !== this._proposalDoc.content.author) {
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

    public receiveChangeRequest(authDid: string) {
        if (authDid !== this._proposalDoc.content.author) {
            console.error('Unauthorized!')
            return
        }
        this._proposalDoc.content.isSubmitted = false
    }

    public requestChange(authDid: string): void {
        if (authDid !== this._template.data.author) {
            console.error('Unauthorized!')
            return
        }

        try {
            this._template.requestChange(authDid, this._proposalDoc)
            this._status = ProposalStatus.ChangeRequested
        } catch (e) {
            console.error(e)
        }
    }

    public receive(authDid: string): void {
        if (authDid !== this._template.data.author) {
            console.error('Unauthorized!')
            return
        }

        try {
            this._template.receive(authDid, this._proposalDoc)
        } catch (e) {
            console.error(e)
        }
    }

    public submit(authDid: string): void {
        if (authDid !== this._proposalDoc.content.author) {
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
