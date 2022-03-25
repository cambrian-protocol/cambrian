import { CompositionModel } from './CompositionModel'
import { FlexInputs } from './SlotTagModel'

export type ProposalModel = {
    title: string
    name: string
    pfp: string
    description: string
    flexInputs: FlexInputs
    templateCID: string
}
