import {
    CREATE_TEMPLATE_STEPS,
    CreateTemplateMultiStepFormType,
    CreateTemplateMultiStepStepsType,
} from '../CreateTemplateMultiStepForm'
import { SetStateAction, useState } from 'react'

import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { Form } from 'grommet'
import { FormExtendedEvent } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import MultiStepFormLayout from '@cambrian/app/components/layout/MultiStepFormLayout'
import MultiStepFormNav from '@cambrian/app/components/nav/MultiStepFormNav'
import { TaggedInput } from '@cambrian/app/models/SlotTagModel'
import { renderFlexInputs } from '@cambrian/app/utils/helpers/flexInputHelpers'

interface CreateTemplateFlexInputStepProps {
    input: CreateTemplateMultiStepFormType
    setInput: React.Dispatch<SetStateAction<CreateTemplateMultiStepFormType>>
    stepperCallback: (step: CreateTemplateMultiStepStepsType) => void
    composition: CompositionModel
}

export type FlexInputFormType = TaggedInput & {
    solverId: string
    tagId: string
}

type CreateTemplateFlexInputStepFormType = {
    flexInputs: FlexInputFormType[]
}

const CreateTemplateFlexInputStep = ({
    input,
    setInput,
    stepperCallback,
    composition,
}: CreateTemplateFlexInputStepProps) => {
    const [flexInputsInput, setflexInputsInput] =
        useState<CreateTemplateFlexInputStepFormType>({
            flexInputs: input.flexInputs,
        })

    const onSubmit = (
        e: FormExtendedEvent<CreateTemplateFlexInputStepFormType, Element>
    ) => {
        e.preventDefault()
        const updatedInput = { ...input, ...flexInputsInput }
        setInput(updatedInput)
        stepperCallback(CREATE_TEMPLATE_STEPS.NOTIFICATION)
    }

    return (
        <Form<CreateTemplateFlexInputStepFormType>
            onChange={(nextValue: CreateTemplateFlexInputStepFormType) => {
                setflexInputsInput(nextValue)
            }}
            value={flexInputsInput}
            onSubmit={(event) => onSubmit(event)}
        >
            <MultiStepFormLayout
                nav={
                    <MultiStepFormNav
                        backward={() =>
                            stepperCallback(
                                CREATE_TEMPLATE_STEPS.PAYMENT_DETAILS
                            )
                        }
                    />
                }
            >
                <HeaderTextSection
                    subTitle={`${4}/${5}`}
                    title="Fair price. Anything here we know already?"
                    paragraph="Leave empty if something here will be defined by your client or partner."
                />
                {renderFlexInputs(input.flexInputs, composition.solvers)}
            </MultiStepFormLayout>
        </Form>
    )
}

export default CreateTemplateFlexInputStep
