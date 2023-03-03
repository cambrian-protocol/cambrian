import { DocumentModel } from '@cambrian/app/services/api/cambrian.api'
import { ProposalModel } from '../../models/ProposalModel'
import ProposalService from '@cambrian/app/services/ProposalService'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import Template from './Template'
import { TemplateModel } from '../../models/TemplateModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { checkAuthorization } from '@cambrian/app/utils/auth.utils'

/* Flow order

---- Proposer ----
1.
create() 
- creates a new Proposal with the current instance
- user must be Proposal author
- adds Proposal to users StagesLib

2.
updateContent()  (optional)
- updates the content of the Proposal
- user must be Proposal author
- Proposal must be in status DRAFT

3.
submit()
- 








*/
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

    public async create() {
        if (!this._auth || !checkAuthorization(this._auth, this._proposalDoc)) {
            return
        }

        try {
            // TODO StagesLib handling
            await this._proposalService.createProposal(this._auth, this._proposalDoc.content)
        } catch (e) {
            console.error(e)
        }
    }

    public refreshDocs(updatedProposalDoc: DocumentModel<ProposalModel>, updatedTemplateDoc?: DocumentModel<TemplateModel>) {
        this._proposalDoc = updatedProposalDoc
        if (updatedTemplateDoc) this._template.refreshDoc(updatedTemplateDoc)
        const status = this.getProposalStatus(updatedTemplateDoc || this.templateDoc, updatedProposalDoc)
        this._status = status
    }

    public async updateContent(updatedProposal: ProposalModel,) {
        if (!this._auth || !checkAuthorization(this._auth, this._proposalDoc)) {
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

        if (this._proposalDoc.content.isSubmitted) {
            this._proposalDoc.content.isSubmitted = false
        }

        try {
            await this._proposalService.saveProposal(this._auth, this._proposalDoc)
        } catch (e) {
            console.error(e)
        }
    }

    public async receiveChangeRequest() {
        if (!this._auth || !checkAuthorization(this._auth, this._proposalDoc)) {
            return
        }

        if (this._status !== ProposalStatus.ChangeRequested) {
            console.error('Invalid status!')
            return
        }

        try {
            this._proposalDoc.content.isSubmitted = false
            await this._proposalService.saveProposal(this._auth, this._proposalDoc)
        } catch (e) {
            console.error(e)
        }
    }

    public async requestChange() {
        if (!this._auth || !checkAuthorization(this._auth, this._template.doc)) {
            return
        }

        if (this._status !== ProposalStatus.OnReview) {
            console.error('Invalid status!')
            return
        }

        try {
            this._template.requestChange(this._proposalDoc)
            this._status = ProposalStatus.ChangeRequested
            await this._proposalService.saveTemplate(this._auth, this._template.doc)
        } catch (e) {
            console.error(e)
        }
    }

    public async receive() {
        if (!this._auth || !checkAuthorization(this._auth, this._template.doc)) {
            return
        }

        if (this._status !== ProposalStatus.Submitted) {
            console.error('Invalid status!')
            return
        }

        try {
            this._template.receive(this._proposalDoc)
            this._status = ProposalStatus.OnReview
            await this._proposalService.saveTemplate(this._auth, this._template.doc)
        } catch (e) {
            console.error(e)
        }
    }

    public async approve() {
        if (!this._auth || !checkAuthorization(this._auth, this._template.doc)) {
            return
        }

        if (this._status !== ProposalStatus.OnReview) {
            console.error('Invalid status!')
            return
        }

        try {
            this._template.approve(this._proposalDoc)
            this._status = ProposalStatus.Approved
            await this._proposalService.saveTemplate(this._auth, this._template.doc)
        } catch (e) {
            console.error(e)
        }
    }

    public async submit() {
        if (!this._auth || !checkAuthorization(this._auth, this._proposalDoc)) {
            return
        }

        const isStatusValid = [
            ProposalStatus.Draft,
            ProposalStatus.Modified,
            ProposalStatus.ChangeRequested
        ].includes(this._status)

        if (!isStatusValid) {
            console.error('Invalid status!')
            return
        }

        this._proposalDoc.content.isSubmitted = true
        this._proposalDoc.content.version = this._proposalDoc.content.version ? ++this._proposalDoc.content.version : 1
        this._status = ProposalStatus.Submitted

        try {
            await this._proposalService.saveProposal(this._auth, this._proposalDoc)
        } catch (e) {
            console.error(e)
        }
    }

    private getProposalStatus(templateDoc: DocumentModel<TemplateModel>, proposalDoc: DocumentModel<ProposalModel>, onChainProposal?: any): ProposalStatus {
        if (onChainProposal) {
            return onChainProposal.isExecuted ? ProposalStatus.Executed : ProposalStatus.Funding
        }

        const receivedProposalCommits = templateDoc.content.receivedProposals[proposalDoc.streamID] || []
        const latestProposalCommit = receivedProposalCommits[receivedProposalCommits.length - 1]

        if (latestProposalCommit) {
            if (latestProposalCommit.isDeclined) {
                return ProposalStatus.Canceled
            } else if (latestProposalCommit.approved) {
                return ProposalStatus.Approved
            } else if (latestProposalCommit.requestChange) {
                const version = proposalDoc.content.version || 0
                const hasNewVersion = version > receivedProposalCommits.length
                if (hasNewVersion && proposalDoc.content.isSubmitted) {
                    return ProposalStatus.Submitted
                } else {
                    return ProposalStatus.ChangeRequested
                }
            } else {
                return ProposalStatus.OnReview
            }
        }

        return proposalDoc.content.isSubmitted ? ProposalStatus.Submitted : ProposalStatus.Draft
    }

}
