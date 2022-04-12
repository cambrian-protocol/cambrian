import { FlexInputFormType } from '@cambrian/app/ui/templates/forms/CreateTemplateForm'

export type ProposalModel = {
    title: string
    name: string
    pfp: string
    description: string
    flexInputs: FlexInputFormType[]
    templateCID: string
}
