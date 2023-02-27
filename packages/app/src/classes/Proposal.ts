import API from '../services/api/cambrian.api'
import { FlexInputFormType } from '../ui/templates/forms/TemplateFlexInputsForm'
import { ProposalModel } from '../models/ProposalModel'
import { SCHEMA_VER } from '@cambrian/app/config'
import { TemplateModel } from '../models/TemplateModel'
import { UserType } from '../store/UserContext'

export default class Proposal {
    protected _schemaVer?: number = SCHEMA_VER['proposal']
    protected _title: string
    protected _description: string
    protected _flexInputs: FlexInputFormType[]
    protected _template: {
        streamID: string
        commitID: string
    }
    protected _price: { amount: number; tokenAddress: string }
    protected _author: string // DID
    protected _isSubmitted: boolean
    protected _isCanceled?: boolean
    protected _streamId?: string


    constructor({ title, description, flexInputs, template, price, author, isSubmitted, isCanceled }: ProposalModel) {
        this._title = title
        this._description = description
        this._flexInputs = flexInputs
        this._template = template // TODO Rename to templateRef
        this._price = price
        this._author = author
        this._isSubmitted = isSubmitted
        this._isCanceled = isCanceled
    }

    public get data(): ProposalModel {
        return {
            title: this._title,
            description: this._description,
            flexInputs: this._flexInputs,
            template: this._template,
            price: this._price,
            author: this._author,
            isSubmitted: this._isSubmitted,
            isCanceled: this._isCanceled
        }
    }

    public async create(title: string, templateStreamId: string, auth: UserType) {
        try {
            if (!auth.did) throw new Error('Unauthorized!')

            // TODO Type casts
            const templateDoc = await API.doc.readStream(templateStreamId) as { content: TemplateModel, streamId: string, commitId: string }

            if (!templateDoc) throw new Error('No Template found!')

            const proposal: ProposalModel = {
                title: title,
                description: '',
                template: {
                    streamID: templateDoc.streamId,
                    commitID: templateDoc.commitId,
                },
                flexInputs: templateDoc.content.flexInputs.filter(
                    (flexInput) =>
                        flexInput.tagId !== 'collateralToken' &&
                        flexInput.value === ''
                ),
                author: auth.did,
                price: {
                    amount:
                        templateDoc.content.price.amount !== ''
                            ? templateDoc.content.price.amount
                            : 0,
                    tokenAddress:
                        templateDoc.content.price
                            .denominationTokenAddress,
                },
                isSubmitted: false,
            }

            // TODO What tags?
            await API.doc.create(auth, proposal, { family: 'proposal', tags: [] })
        } catch (e) { console.error(e) }


    }


    public async archive() {

    }

    public async cancel(auth: UserType) {

        /*    await API.doc.updateStream(auth, )
   
           // Add isCanceled flag to proposal
           const proposalDoc = (await TileDocument.load(
               ceramicInstance(this.user),
               proposalStreamID
           )) as TileDocument<ProposalModel>
   
           await proposalDoc.update({
               ...proposalDoc.content,
               isCanceled: true,
           })
   
           await this.archive() */
    }

}
