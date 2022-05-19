import {
    CREATE_PROPOSAL_STEPS,
    CreateProposalMultiStepFormType,
    CreateProposalMultiStepStepsType,
} from '../CreateProposalMultiStepForm'
import { SetStateAction, useState } from 'react'

import { Box } from 'grommet'
import { Form } from 'grommet'
import { FormExtendedEvent } from 'grommet'
import { FormField } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import MultiStepFormLayout from '@cambrian/app/components/layout/MultiStepFormLayout'
import MultiStepFormNav from '@cambrian/app/components/nav/MultiStepFormNav'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { Text } from 'grommet'
import { TextArea } from 'grommet'

interface CreateProposalDetailStepProps {
    input: CreateProposalMultiStepFormType
    setInput: React.Dispatch<SetStateAction<CreateProposalMultiStepFormType>>
    stepperCallback: (step: CreateProposalMultiStepStepsType) => void
    template: TemplateModel
}
type CreateProposalDetailStepFormType = {
    title: string
    description: string
}

const CreateProposalDetailStep = ({
    setInput,
    input,
    stepperCallback,
    template,
}: CreateProposalDetailStepProps) => {
    const [detailInput, setDetailInput] =
        useState<CreateProposalDetailStepFormType>({
            title: input.title || '',
            description: input.description || '',
        })

    const onSubmit = (
        e: FormExtendedEvent<CreateProposalDetailStepFormType, Element>
    ) => {
        e.preventDefault()
        const updatedInput = { ...input, ...detailInput }
        setInput(updatedInput)
        stepperCallback(CREATE_PROPOSAL_STEPS.PAYMENT_DETAILS)
    }

    return (
        <Form<CreateProposalDetailStepFormType>
            onChange={(nextValue: CreateProposalDetailStepFormType) => {
                setDetailInput(nextValue)
            }}
            value={detailInput}
            onSubmit={(event) => onSubmit(event)}
        >
            <MultiStepFormLayout
                nav={
                    <MultiStepFormNav
                        backward={() =>
                            stepperCallback(CREATE_PROPOSAL_STEPS.BUYER_DETAILS)
                        }
                    />
                }
            >
                <Box pad="large" />
                <HeaderTextSection
                    subTitle={`${2}/${input.flexInputs.length > 0 ? 5 : 4}`}
                    title={`Alright, ${input.name}${
                        input.name?.trim() !== '' ? '.' : ''
                    } ${
                        input.name?.trim() !== '' ? 'P' : 'p'
                    }rovide us with details about the project`}
                    paragraph={
                        'Please be sure to include information requested by the Template description.'
                    }
                />
                <Text>{template.title}</Text>
                <Text color="dark-4">{template.description}</Text>
                <Box pad="medium" />
                <FormField
                    name="title"
                    label="Title"
                    required
                    placeholder={'Type your proposal title here...'}
                />
                <FormField name="description" label="Description" required>
                    <TextArea
                        name="description"
                        placeholder={'Type your proposal desciption here...'}
                        rows={9}
                        resize={false}
                    />
                </FormField>
            </MultiStepFormLayout>
            <Box pad="large" />
        </Form>
    )
}

export default CreateProposalDetailStep
