import { FlexInputFormType } from '../ui/templates/forms/TemplateFlexInputsForm'

export type ProposalModel = {
    id: string
    title: string
    description: string
    flexInputs: FlexInputFormType[]
    template: {
        streamID: string
        commitID: string
    }
    price: { amount: number; tokenAddress: string }
    author: string // DID
    isSubmitted: boolean
    isCanceled?: boolean
}
