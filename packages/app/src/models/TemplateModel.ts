import { FlexInputFormType } from '../ui/templates/forms/TemplateFlexInputsForm'
import { TokenModel } from './TokenModel'

export type TemplateModel = {
    pfp?: string
    name?: string
    title: string
    description: string
    price?: {
        amount: number
        denominationTokenAddress: string
        preferredTokens?: TokenModel[]
        allowAnyPaymentToken: boolean
    }
    compositionCID: string
    flexInputs: FlexInputFormType[]
}

export type CeramicTemplateModel = {
    title: string
    description: string
    requirements: string
    price?: {
        amount: number
        denominationTokenAddress: string
        preferredTokens?: TokenModel[]
        allowAnyPaymentToken: boolean
    }
    composition: {
        streamID: string
        commitID: string
    }
    flexInputs: FlexInputFormType[]
    author: string // DID
}
