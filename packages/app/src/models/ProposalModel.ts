import { FlexInputFormType } from '../ui/templates/forms/steps/CreateTemplateFlexInputStep'
import { TokenModel } from './TokenModel'

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
    price: {
        amount: number
        denominationTokenAddress: string
        preferredTokens?: TokenModel[]
        allowAnyPaymentToken: boolean
    }
    authors: string[] // DIDs
    approved: boolean // True only for the controller of this stream
}
