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

interface CreateTemplateSellerStepProps {
    stepperCallback: (step: CreateTemplateMultiStepStepsType) => void
    input: CreateTemplateMultiStepFormType
    setInput: React.Dispatch<SetStateAction<CreateTemplateMultiStepFormType>>
}

type CreateTemplateSellerStepFormType = {
    name: string
    pfp: string
}

const CreateTemplateSellerStep = ({
    stepperCallback,
    input,
    setInput,
}: CreateTemplateSellerStepProps) => {
    const [sellerInput, setSellerInput] =
        useState<CreateTemplateSellerStepFormType>({
            name: input.name || '',
            pfp: input.pfp || '',
        })

    const onSubmit = (
        e: FormExtendedEvent<CreateTemplateSellerStepFormType, Element>
    ) => {
        e.preventDefault()
        const updatedInput = { ...input, ...sellerInput }
        setInput(updatedInput)
        stepperCallback(CREATE_TEMPLATE_STEPS.TEMPLATE_DETAILS)
    }

    return (
        <Form<CreateTemplateSellerStepFormType>
            onChange={(nextValue: CreateTemplateSellerStepFormType) => {
                setSellerInput(nextValue)
            }}
            value={sellerInput}
            onSubmit={(event) => onSubmit(event)}
        >
            <MultiStepFormLayout
                nav={
                    <MultiStepFormNav
                        backward={() =>
                            stepperCallback(CREATE_TEMPLATE_STEPS.START)
                        }
                    />
                }
            >
                <HeaderTextSection
                    subTitle={`${1}/${input.flexInputs.length > 0 ? 5 : 4}`}
                    title="Who is providing the service?"
                    paragraph="People like to know who they're working with. Leave this blank if you wish, Anon."
                />
                <FormField name="name" label="Your/Organization Name" />
                <FormField
                    name="pfp"
                    label="Profile Picture URL"
                    placeholder="https://your.profile-picture.com"
                />
            </MultiStepFormLayout>
        </Form>
    )
}

export default CreateTemplateSellerStep
