import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { DocumentModel } from '@cambrian/app/services/api/cambrian.api'
import { ProposalModel } from '../../models/ProposalModel'
import ProposalService from '@cambrian/app/services/stages/ProposalService'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import Template from './Template'
import { TemplateModel } from '../../models/TemplateModel'
import TemplateService from '@cambrian/app/services/stages/TemplateService'
import { TokenModel } from '@cambrian/app/models/TokenModel'
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

export interface ProposalConfig extends IStageStack {
    tokens: {
        collateral: TokenModel
        denomination: TokenModel
    }
    onChainProposal?: any
}

export interface IStageStack {
    proposalDocs: {
        streamDoc: DocumentModel<ProposalModel>,
        latestCommitDoc?: DocumentModel<ProposalModel>
    },
    templateDocs: {
        streamDoc: DocumentModel<TemplateModel>,
        commitDoc: DocumentModel<TemplateModel>
    }
    compositionDoc: DocumentModel<CompositionModel>,
}

export default class Proposal {
    private _auth?: UserType | null

    private _onChainProposal?: any // TODO Types
    private _proposalStreamDoc: DocumentModel<ProposalModel>
    private _latestProposalCommitDoc?: DocumentModel<ProposalModel>

    private _template: Template
    private _templateCommitDoc: DocumentModel<TemplateModel>

    private _collateralToken: TokenModel

    private _status: ProposalStatus = ProposalStatus.Unknown
    private _proposalService: ProposalService


    constructor(
        config: ProposalConfig,
        proposalService: ProposalService,
        templateService: TemplateService,
        auth?: UserType | null,
    ) {
        this._auth = auth
        this._proposalService = proposalService

        const { compositionDoc, templateDocs, proposalDocs, tokens, onChainProposal } = config

        this._collateralToken = tokens.collateral
        this._proposalStreamDoc = proposalDocs.streamDoc
        this._latestProposalCommitDoc = proposalDocs.latestCommitDoc
        this._onChainProposal = onChainProposal
        this._status = this.getProposalStatus(templateDocs.streamDoc, proposalDocs.streamDoc)

        this._template = new Template(compositionDoc, templateDocs.streamDoc, tokens.denomination, templateService, auth)
        this._templateCommitDoc = templateDocs.commitDoc
    }

    public get content(): ProposalModel {
        return this._proposalStreamDoc.content
    }

    public get doc(): DocumentModel<ProposalModel> {
        return this._proposalStreamDoc
    }

    public get latestCommitDoc(): DocumentModel<ProposalModel> | undefined {
        return this._latestProposalCommitDoc
    }

    public get template(): Template {
        return this._template
    }

    public get templateCommitDoc(): DocumentModel<TemplateModel> {
        return this._templateCommitDoc
    }

    public get compositionDoc(): DocumentModel<CompositionModel> {
        return this.template.compositionDoc
    }

    public get status(): ProposalStatus {
        return this._status
    }

    public get collateralToken(): TokenModel {
        return this._collateralToken
    }

    public get denomintaionToken(): TokenModel {
        return this._template.denominationToken
    }

    public get isValid(): boolean {
        return this._proposalStreamDoc.content.title.length > 0 &&
            this._proposalStreamDoc.content.description.length > 0 &&
            this._proposalStreamDoc.content.price.tokenAddress.length > 0 &&
            this._proposalStreamDoc.content.flexInputs.every(
                (flexInput) => flexInput.value.length > 0
            )
    }

    public refreshDocs(updatedProposalStreamDoc: DocumentModel<ProposalModel>, updatedTemplateStreamDoc?: DocumentModel<TemplateModel>) {
        this._proposalStreamDoc = updatedProposalStreamDoc
        if (updatedTemplateStreamDoc) this._template.refreshDoc(updatedTemplateStreamDoc)
        this._status = this.getProposalStatus(updatedTemplateStreamDoc || this.template.doc, updatedProposalStreamDoc)
    }

    public async updateContent(updatedProposal: ProposalModel) {
        if (!this._auth || !checkAuthorization(this._auth, this._proposalStreamDoc)) {
            return
        }

        if (!isStatusValid(this._status,
            [ProposalStatus.Draft,
            ProposalStatus.ChangeRequested,
            ProposalStatus.Modified,])) {
            return
        }

        const unsubmittedUpdatedProposal = { ...updatedProposal, isSubmitted: false }

        try {
            if (this._proposalStreamDoc.content.price.tokenAddress !== updatedProposal.price.tokenAddress) {
                const newToken = await this._proposalService.fetchToken(updatedProposal.price.tokenAddress, this._auth)
                if (!newToken) throw new Error('Failed to fetch collateralToken')
                this._collateralToken = newToken
            }

            await this._proposalService.update(this._auth, this._proposalStreamDoc, unsubmittedUpdatedProposal)
        } catch (e) {
            console.error(e)
            return
        }

        this._proposalStreamDoc.content = unsubmittedUpdatedProposal
        if (this._status !== ProposalStatus.Draft) {
            this._status = ProposalStatus.Modified
        }
    }

    public async submit() {
        if (!this._auth || !checkAuthorization(this._auth, this._proposalStreamDoc)) {
            return
        }

        if (!isStatusValid(this._status,
            [ProposalStatus.Draft,
            ProposalStatus.Modified,
            ProposalStatus.ChangeRequested])) {
            return
        }

        if (!this._template.content.isActive && !this._template.content.receivedProposals[this._proposalStreamDoc.streamID]) {
            return
        }

        const updatedProposal = {
            ...this._proposalStreamDoc.content,
            isSubmitted: true,
            version: this._proposalStreamDoc.content.version ? ++this._proposalStreamDoc.content.version : 1
        }

        try {
            await this._proposalService.update(this._auth, this._proposalStreamDoc, updatedProposal)
            const res = await this._proposalService.submit(this._auth, this._proposalStreamDoc.streamID)

            if (!res || res.status !== 200) {
                throw Error('Failed to submit Proposal.')
            }
        } catch (e) {
            console.error(e)
            return
        }

        this._status = ProposalStatus.Submitted
        this._proposalStreamDoc.content = updatedProposal
    }

    public async cancel() {
        if (!this._auth || !checkAuthorization(this._auth, this._proposalStreamDoc)) {
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

        const updatedProposal = {
            ...this._proposalStreamDoc.content,
            isCanceled: true,
        }
        try {
            await this._proposalService.update(this._auth, this._proposalStreamDoc, updatedProposal)
            await this._proposalService.cancel(this._auth, this._proposalStreamDoc.streamID)
        } catch (e) {
            console.error(e)
            return
        }

        this._status = ProposalStatus.Canceled
        this._proposalStreamDoc.content = updatedProposal
    }

    public async receive() {
        if (!this._auth || !checkAuthorization(this._auth, this._template.doc)) {
            return
        }

        if (!isStatusValid(this._status, [ProposalStatus.Submitted])) {
            return
        }

        try {
            await this._template.receive(this._proposalStreamDoc)
        } catch (e) {
            console.error(e)
            return
        }

        this._status = ProposalStatus.OnReview
    }

    public async approve() {
        if (!this._auth || !checkAuthorization(this._auth, this._template.doc)) {
            return
        }

        if (!isStatusValid(this._status, [ProposalStatus.OnReview])) {
            return
        }

        try {
            await this._template.approve(this._proposalStreamDoc)
        } catch (e) {
            console.error(e)
            return
        }

        this._status = ProposalStatus.Approved
    }

    public async decline() {
        if (!this._auth || !checkAuthorization(this._auth, this._template.doc)) {
            return
        }

        if (!isStatusValid(this._status, [ProposalStatus.OnReview])) {
            return
        }

        try {
            await this._template.decline(this._proposalStreamDoc)
        } catch (e) {
            console.error(e)
            return
        }

        this._status = ProposalStatus.Declined
    }

    public async requestChange() {
        if (!this._auth || !checkAuthorization(this._auth, this._template.doc)) {
            return
        }

        if (!isStatusValid(this._status, [ProposalStatus.OnReview])) {
            return
        }

        try {
            await this._template.requestChange(this._proposalStreamDoc)
        } catch (e) {
            console.error(e)
            return
        }

        this._status = ProposalStatus.ChangeRequested
    }

    public async receiveChangeRequest() {
        if (!this._auth || !checkAuthorization(this._auth, this._proposalStreamDoc)) {
            return
        }

        if (!isStatusValid(this._status, [ProposalStatus.ChangeRequested])) {
            return
        }

        const unsubmittedUpdatedProposal = { ...this._proposalStreamDoc.content, isSubmitted: false }

        try {
            await this._proposalService.update(this._auth, this._proposalStreamDoc, unsubmittedUpdatedProposal)
        } catch (e) {
            console.error(e)
            return
        }

        this._proposalStreamDoc.content = unsubmittedUpdatedProposal
    }

    public async archive() {
        if (!this._auth || !checkAuthorization(this._auth, this._proposalStreamDoc)) {
            return
        }

        try {
            await this._proposalService.archive(this._auth, this._proposalStreamDoc.streamID)
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
                    if (this._auth?.did === this._proposalStreamDoc.content.author && !this._proposalStreamDoc.content.isSubmitted) {
                        return ProposalStatus.Modified
                    } else {
                        return ProposalStatus.ChangeRequested
                    }
                }
            } else {
                return ProposalStatus.OnReview
            }
        }

        return proposalDoc.content.isSubmitted ? ProposalStatus.Submitted : ProposalStatus.Draft
    }

}
