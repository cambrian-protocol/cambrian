import {
    CREATE_TEMPLATE_STEPS,
    CreateTemplateMultiStepFormType,
    CreateTemplateMultiStepStepsType,
} from '../CreateTemplateMultiStepForm'
import { SetStateAction, useState } from 'react'

import { Form } from 'grommet'
import { FormExtendedEvent } from 'grommet'
import { FormField } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import MultiStepFormLayout from '@cambrian/app/components/layout/MultiStepFormLayout'
import MultiStepFormNav from '@cambrian/app/components/nav/MultiStepFormNav'
import { TextArea } from 'grommet'

interface CreateTemplateTemplateStepProps {
    input: CreateTemplateMultiStepFormType
    setInput: React.Dispatch<SetStateAction<CreateTemplateMultiStepFormType>>
    stepperCallback: (step: CreateTemplateMultiStepStepsType) => void
}
type CreateTemplateTemplateStepFormType = {
    title: string
    description: string
}

const CreateTemplateTemplateStep = ({
    stepperCallback,
    input,
    setInput,
}: CreateTemplateTemplateStepProps) => {
    const [templateInput, setTemplateInput] =
        useState<CreateTemplateTemplateStepFormType>({
            title: input.title || '',
            description: input.description || '',
        })

    const onSubmit = (
        e: FormExtendedEvent<CreateTemplateTemplateStepFormType, Element>
    ) => {
        e.preventDefault()
        const updatedInput = { ...input, ...templateInput }
        setInput(updatedInput)
        stepperCallback(CREATE_TEMPLATE_STEPS.PAYMENT_DETAILS)
    }

    return (
        <Form<CreateTemplateTemplateStepFormType>
            onChange={(nextValue: CreateTemplateTemplateStepFormType) => {
                setTemplateInput(nextValue)
            }}
            value={templateInput}
            onSubmit={(event) => onSubmit(event)}
        >
            <MultiStepFormLayout
                nav={
                    <MultiStepFormNav
                        backward={() =>
                            stepperCallback(
                                CREATE_TEMPLATE_STEPS.SELLER_DETAILS
                            )
                        }
                    />
                }
            >
                <HeaderTextSection
                    subTitle={`${2}/${input.flexInputs.length > 0 ? 5 : 4}`}
                    title={`Alright, ${input.name}${
                        input.name?.trim() !== '' ? '.' : ''
                    } ${
                        input.name?.trim() !== '' ? 'W' : 'w'
                    }hat do you want to solve?`}
                    paragraph="Tell us what problem you will solve or describe the service your offering."
                />
                <FormField
                    name="title"
                    label="Title"
                    required
                    placeholder="I will change the world..."
                />
                <FormField name="description" label="Description" required>
                    <TextArea
                        name="description"
                        placeholder="Nothing will be like it was before..."
                        rows={5}
                        resize={false}
                    />
                </FormField>
            </MultiStepFormLayout>
        </Form>
    )
}

export default CreateTemplateTemplateStep
