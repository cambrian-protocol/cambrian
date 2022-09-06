import { FlexInputFormType } from '../ui/templates/forms/TemplateFlexInputsForm'
import { TokenModel } from './TokenModel'

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
    isActive?: boolean
}

export type ReceivedProposalsHashmapType = {
    [proposalStreamID: string]: ReceivedProposalCommitType[]
}

export type ReceivedProposalCommitType = {
    proposalCommitID: string
} & ReceivedProposalPropsType

export type ReceivedProposalPropsType = {
    approved?: boolean
    requestChange?: boolean
    isDeclined?: boolean
}

export type TemplatePriceModel = {
    amount: number
    denominationTokenAddress: string
    preferredTokens: TokenModel[]
    allowAnyPaymentToken: boolean
    isCollateralFlex: boolean
}
