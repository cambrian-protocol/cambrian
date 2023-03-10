import { FlexInputFormType } from '../ui/templates/forms/TemplateFlexInputsForm'

export type ProposalModel = {
    schemaVer?: number
    title: string
    description: string
    flexInputs: FlexInputFormType[]
    template: {
        streamID: string
        commitID: string
    }
    price: ProposalPriceModel
    author: string // DID
    isSubmitted: boolean
    isCanceled?: boolean
    version?: number
}

export type ProposalPriceModel = { amount: number | ''; tokenAddress: string }
