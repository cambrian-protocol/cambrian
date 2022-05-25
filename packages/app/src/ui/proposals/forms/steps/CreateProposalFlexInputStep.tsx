import {
    CREATE_PROPOSAL_STEPS,
    CreateProposalMultiStepFormType,
    CreateProposalMultiStepStepsType,
} from '../CreateProposalMultiStepForm'
import { SetStateAction, useState } from 'react'

import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { FlexInputFormType } from '@cambrian/app/ui/templates/forms/steps/CreateTemplateFlexInputStep'
import { Form } from 'grommet'
import { FormExtendedEvent } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import MultiStepFormLayout from '@cambrian/app/components/layout/MultiStepFormLayout'
import MultiStepFormNav from '@cambrian/app/components/nav/MultiStepFormNav'
import { renderFlexInputs } from '@cambrian/app/utils/helpers/flexInputHelpers'

interface CreateProposalFlexInputStepProps {
    input: CreateProposalMultiStepFormType
    setInput: React.Dispatch<SetStateAction<CreateProposalMultiStepFormType>>
    stepperCallback: (step: CreateProposalMultiStepStepsType) => void
    composition: CompositionModel
}

type CreateProposalFlexInputStepFormType = {
    flexInputs: FlexInputFormType[]
}

const CreateProposalFlexInputStep = ({
    input,
    stepperCallback,
    setInput,
    composition,
}: CreateProposalFlexInputStepProps) => {
    const [flexInputsInput, setflexInputsInput] =
        useState<CreateProposalFlexInputStepFormType>({
            flexInputs: input.flexInputs,
        })

    const onSubmit = (
        e: FormExtendedEvent<CreateProposalFlexInputStepFormType, Element>
    ) => {
        e.preventDefault()
        const updatedInput = { ...input, ...flexInputsInput }
        setInput(updatedInput)
        stepperCallback(CREATE_PROPOSAL_STEPS.NOTIFICATION)
    }

    return (
        <Form<CreateProposalFlexInputStepFormType>
            onChange={(nextValue: CreateProposalFlexInputStepFormType) => {
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
                                CREATE_PROPOSAL_STEPS.PAYMENT_DETAILS
                            )
                        }
                    />
                }
            >
                <HeaderTextSection
                    subTitle={`${4}/${5}`}
                    title="Reasonable. Just a few more details"
                    paragraph="Please input the following information to set up the Solver correctly."
                />
                {renderFlexInputs(input.flexInputs, composition.solvers, true)}
            </MultiStepFormLayout>
        </Form>
    )
}

export default CreateProposalFlexInputStep
