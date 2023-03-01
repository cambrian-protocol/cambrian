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

    public requestChange(authDid: string) {
        try {
            if (authDid !== this._template.data.author) throw new Error('Unauthorized!')
            this._template.requestChange(authDid, this._proposalDoc)
            this._status = ProposalStatus.ChangeRequested
        } catch (e) {
            console.error(e)
        }
    }

    public receive(authDid: string) {
        try {
            if (authDid !== this._template.data.author) throw new Error('Unauthorized!')
            this._template.receive(authDid, this._proposalDoc)
        } catch (e) {
            console.error(e)
        }
    }

    public submit(authDid: string) {
        try {
            if (authDid !== this._proposalDoc.content.author) throw new Error('Unauthorized!')
            this._proposalDoc.content.isSubmitted = true
            this._status = ProposalStatus.OnReview
        } catch (e) {
            console.error(e)
        }
    }

    // TODO Refactor
    private getProposalStatus(templateDoc: DocumentModel<TemplateModel>, proposalDoc: DocumentModel<ProposalModel>, onChainProposal?: any): ProposalStatus {
        if (onChainProposal) {
            if (onChainProposal.isExecuted) {
                return ProposalStatus.Executed
            } else {
                return ProposalStatus.Funding
            }
        }

        if (this.getApprovedProposalCommitID(templateDoc.content.receivedProposals)) {
            return ProposalStatus.Approved
        }

        if (proposalDoc.content.isCanceled) {
            return ProposalStatus.Canceled
        }

        const receivedProposalCommits = templateDoc.content.receivedProposals[proposalDoc.streamID]

        if (receivedProposalCommits) {
            const proposalCommit =
                receivedProposalCommits[receivedProposalCommits.length - 1]

            if (proposalCommit.isDeclined) {
                return ProposalStatus.Canceled
            } else if (proposalCommit.approved) {
                return ProposalStatus.Approved
            } else if (proposalCommit.requestChange) {
                return ProposalStatus.ChangeRequested
            } else {
                return ProposalStatus.OnReview
            }
        } else {
            if (proposalDoc.content.isSubmitted) {
                return ProposalStatus.OnReview
            } else {
                return ProposalStatus.Draft
            }
        }
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
