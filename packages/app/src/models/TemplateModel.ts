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
    price: TemplatePriceModel
    composition: {
        streamID: string
        commitID: string
    }
    flexInputs: FlexInputFormType[]
    author: string // DID
    receivedProposals: ReceivedProposalsHashmapType
}

export type ReceivedProposalsHashmapType = {
    [proposalStreamID: string]: ({
        proposalCommitID: string
    } & ReceivedProposalPropsType)[]
}

export type ReceivedProposalPropsType = {
    approved?: boolean
    requestChange?: boolean
}

export type TemplatePriceModel = {
    amount: number
    denominationTokenAddress: string
    preferredTokens?: TokenModel[]
    allowAnyPaymentToken: boolean
    isCollateralFlex: boolean
}
