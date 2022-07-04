import { FlexInputFormType } from '../ui/templates/forms/TemplateFlexInputsForm'

export type ProposalModel = {
    title: string
    name: string
    pfp: string
    description: string
    flexInputs: FlexInputFormType[]
    templateCID: string
    solverConfigsCID: string
}

export type CeramicProposalModel = {
    title: string
    description: string
    flexInputs: FlexInputFormType[]
    template: {
        streamID: string
        commitID: string
    }
    price: { amount: number; tokenAddress: string }
    authors: string[] // DIDs
    approved: boolean // True only for the controller of this stream
}
