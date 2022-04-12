import { FlexInputFormType } from '../ui/templates/forms/CreateTemplateForm'
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
