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

interface CreateTemplateDetailStepProps {
    input: CreateTemplateMultiStepFormType
    setInput: React.Dispatch<SetStateAction<CreateTemplateMultiStepFormType>>
    stepperCallback: (step: CreateTemplateMultiStepStepsType) => void
}
type CreateTemplateDetailStepFormType = {
    title: string
    description: string
}

const CreateTemplateDetailStep = ({
    stepperCallback,
    input,
    setInput,
}: CreateTemplateDetailStepProps) => {
    const [templateInput, setTemplateInput] =
        useState<CreateTemplateDetailStepFormType>({
            title: input.title || '',
            description: input.description || '',
        })

    const onSubmit = (
        e: FormExtendedEvent<CreateTemplateDetailStepFormType, Element>
    ) => {
        e.preventDefault()
        const updatedInput = { ...input, ...templateInput }
        setInput(updatedInput)
        stepperCallback(CREATE_TEMPLATE_STEPS.PAYMENT_DETAILS)
    }

    return (
        <Form<CreateTemplateDetailStepFormType>
            onChange={(nextValue: CreateTemplateDetailStepFormType) => {
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
                    title={`What service are you offering?`}
                    paragraph="Let the world know how you can help."
                />
                <FormField
                    name="title"
                    label="Title"
                    required
                    placeholder='Short summary of your service, i.e. "English to Spanish Technical Translation."'
                />
                <FormField name="description" label="Description" required>
                    <TextArea
                        name="description"
                        placeholder="Describe your service at length. Communicate your unique value, details of your service, and the format and content of information you need from customers. Customers will send proposals in response to this description."
                        rows={9}
                        resize={false}
                    />
                </FormField>
            </MultiStepFormLayout>
        </Form>
    )
}

export default CreateTemplateDetailStep
