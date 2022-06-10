import { FlexInputFormType } from '../ui/templates/forms/steps/CreateTemplateFlexInputStep'

export type ProposalModel = {
    title: string
    name: string
    pfp: string
    description: string
    flexInputs: FlexInputFormType[]
    templateCID: string
    solverConfigsCID: string
}
