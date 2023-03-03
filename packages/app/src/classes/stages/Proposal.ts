import { DocumentModel } from '@cambrian/app/services/api/cambrian.api'
import { ProposalModel } from '../../models/ProposalModel'
import ProposalService from '@cambrian/app/services/ProposalService'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import Template from './Template'
import { TemplateModel } from '../../models/TemplateModel'
import TemplateService from '@cambrian/app/services/TemplateService'
import { UserType } from '@cambrian/app/store/UserContext'
import { checkAuthorization } from '@cambrian/app/utils/auth.utils'
import { isStatusValid } from '@cambrian/app/utils/proposal.utils'

/* Flow order

---- Proposer ----

1.
create() 
- AUTH: user must be Proposal author
- creates a new Proposal with the current instance
- adds Proposal to users StagesLib

2. (optional)
updateContent()  
- AUTH: user must be Proposal author
- STATUS: Proposal must be in DRAFT, CHANGE_REQUESTED or MODIFIED
- updates the content of the Proposal

3.
submit()
- AUTH: user must be Proposal author
- STATUS: Proposal must be in DRAFT, CHANGE_REQUESTED or MODIFIED
- changes the isSubmitted flag to true
- sets version number to 1

---- Templater ----

4.
receive()
- AUTH: user must be Template author
- STATUS: Proposal must be in SUBMITTED
- adds an entry at the Templates receivedProposals with the current proposals streamId as the key and creates an array for every proposal commit with the first entry of an object containing the current proposals commitId 

5. a (optional)
approve()
- AUTH: user must be Template author
- STATUS: Proposal must be ONREVIEW
- modifies the latest received proposal commit entry and sets the approved flag to true

5. b (optional)
decline()
- AUTH: user must be Template author
- STATUS: Proposal must be ONREVIEW
- modifies the latest received proposal commit entry and sets the isDeclined flag to true

5. c (optional)
requestChange()
- AUTH: user must be Template author
- STATUS: Proposal must be ONREVIEW
- modifies the latest received proposal commit entry and sets the requestChange flag to true

    ---- Proposer ----

    6. (optional)
    receiveChangeRequest()
    - AUTH: user must be Proposal author
    - STATUS: Proposal must be in CHANGE_REQUESTED
    - resets the isSubmitted flag to false

    7. (optional)
    updateContent()  
    - AUTH: user must be Proposal author
    - STATUS: Proposal must be in CHANGE_REQUESTED or MODIFIED
    - updates the content of the Proposal

    3. 
    submit()
    - AUTH: user must be Proposal author
    - STATUS: Proposal must be in CHANGE_REQUESTED or MODIFIED
    - changes the isSubmitted flag to true
    - increments the Proposals version number

    ...Continue with 4.

*/
export default class Proposal {
    private _auth?: UserType
    private _proposalDoc: DocumentModel<ProposalModel>
    private _template: Template
    private _status: ProposalStatus = ProposalStatus.Unknown
    private _proposalService: ProposalService


    constructor(
        templateStreamDoc: DocumentModel<TemplateModel>,
        proposalDoc: DocumentModel<ProposalModel>,
        proposalService: ProposalService,
        templateService: TemplateService,
        auth?: UserType,
    ) {
        this._auth = auth
        this._proposalService = proposalService
        this._proposalDoc = proposalDoc
        this._template = new Template(templateStreamDoc, templateService, auth)
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

    public refreshDocs(updatedProposalDoc: DocumentModel<ProposalModel>, updatedTemplateDoc?: DocumentModel<TemplateModel>) {
        this._proposalDoc = updatedProposalDoc
        if (updatedTemplateDoc) this._template.refreshDoc(updatedTemplateDoc)
        const status = this.getProposalStatus(updatedTemplateDoc || this.templateDoc, updatedProposalDoc)
        this._status = status
    }

    public async create() {
        if (!this._auth || !checkAuthorization(this._auth, this._proposalDoc)) {
            return
        }

        try {
            await this._proposalService.create(this._auth, this._proposalDoc.content)
        } catch (e) {
            console.error(e)
        }
    }

    public async updateContent(updatedProposal: ProposalModel,) {
        if (!this._auth || !checkAuthorization(this._auth, this._proposalDoc)) {
            return
        }

        if (!isStatusValid(this._status,
            [ProposalStatus.Draft,
            ProposalStatus.ChangeRequested,
            ProposalStatus.Modified,])) {
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
            await this._proposalService.save(this._auth, this._proposalDoc)
        } catch (e) {
            console.error(e)
        }
    }

    public async submit() {
        if (!this._auth || !checkAuthorization(this._auth, this._proposalDoc)) {
            return
        }

        if (!isStatusValid(this._status,
            [ProposalStatus.Draft,
            ProposalStatus.Modified,
            ProposalStatus.ChangeRequested])) {
            return
        }

        this._status = ProposalStatus.Submitted
        this._proposalDoc.content.isSubmitted = true
        this._proposalDoc.content.version = this._proposalDoc.content.version ? ++this._proposalDoc.content.version : 1

        try {
            await this._proposalService.save(this._auth, this._proposalDoc)
            await this._proposalService.submit(this._auth, this._proposalDoc.streamID)
        } catch (e) {
            console.error(e)
        }
    }

    public async cancel() {
        if (!this._auth || !checkAuthorization(this._auth, this._proposalDoc)) {
            return
        }

        if (!isStatusValid(this._status,
            [ProposalStatus.OnReview,
            ProposalStatus.ChangeRequested,
            ProposalStatus.Modified,
            ProposalStatus.Submitted,
            ])) {
            return
        }

        this._status = ProposalStatus.Canceled
        this._proposalDoc.content.isCanceled = true

        try {
            await this._proposalService.save(this._auth, this._proposalDoc)
            await this._proposalService.cancel(this._auth, this._proposalDoc.streamID)
        } catch (e) {
            console.error(e)
        }
    }

    public async receive() {
        if (!this._auth || !checkAuthorization(this._auth, this._template.doc)) {
            return
        }

        if (!isStatusValid(this._status, [ProposalStatus.Submitted])) {
            return
        }

        this._status = ProposalStatus.OnReview

        try {
            await this._template.receive(this._proposalDoc)
        } catch (e) {
            console.error(e)
        }
    }

    public async approve() {
        if (!this._auth || !checkAuthorization(this._auth, this._template.doc)) {
            return
        }

        if (!isStatusValid(this._status, [ProposalStatus.OnReview])) {
            return
        }

        this._status = ProposalStatus.Approved

        try {
            await this._template.approve(this._proposalDoc)
        } catch (e) {
            console.error(e)
        }
    }

    public async decline() {
        if (!this._auth || !checkAuthorization(this._auth, this._template.doc)) {
            return
        }

        if (!isStatusValid(this._status, [ProposalStatus.OnReview])) {
            return
        }

        this._status = ProposalStatus.Declined

        try {
            await this._template.decline(this._proposalDoc)
        } catch (e) {
            console.error(e)
        }
    }

    public async requestChange() {
        if (!this._auth || !checkAuthorization(this._auth, this._template.doc)) {
            return
        }

        if (!isStatusValid(this._status, [ProposalStatus.OnReview])) {
            return
        }

        this._status = ProposalStatus.ChangeRequested

        try {
            await this._template.requestChange(this._proposalDoc)
        } catch (e) {
            console.error(e)
        }
    }

    public async receiveChangeRequest() {
        if (!this._auth || !checkAuthorization(this._auth, this._proposalDoc)) {
            return
        }

        if (!isStatusValid(this._status, [ProposalStatus.ChangeRequested])) {
            return
        }

        this._proposalDoc.content.isSubmitted = false

        try {
            await this._proposalService.save(this._auth, this._proposalDoc)
        } catch (e) {
            console.error(e)
        }
    }

    public async archive() {
        // TODO
    }

    private getProposalStatus(templateDoc: DocumentModel<TemplateModel>, proposalDoc: DocumentModel<ProposalModel>, onChainProposal?: any): ProposalStatus {
        if (onChainProposal) {
            return onChainProposal.isExecuted ? ProposalStatus.Executed : ProposalStatus.Funding
        }

        const receivedProposalCommits = templateDoc.content.receivedProposals[proposalDoc.streamID] || []
        const latestProposalCommit = receivedProposalCommits[receivedProposalCommits.length - 1]

        if (proposalDoc.content.isCanceled) {
            return ProposalStatus.Canceled
        }

        if (latestProposalCommit) {
            if (latestProposalCommit.isDeclined) {
                return ProposalStatus.Declined
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
