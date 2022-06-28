import {
    TEMPLATE_WIZARD_STEPS,
    TemplateFormType,
    TemplateWizardStepsType,
} from '../TemplateWizard'
import TemplateRequirementsForm, {
    TemplateRequirementsFormType,
} from '../../forms/TemplateRequirementsForm'

import { FormExtendedEvent } from 'grommet'
import { SetStateAction } from 'react'

interface TemplateRequirementsStepProps {
    stepperCallback: (step: TemplateWizardStepsType) => void
    input: TemplateFormType
    setInput: React.Dispatch<SetStateAction<TemplateFormType>>
    createTemplate: (inputs: TemplateFormType) => Promise<void>
}

const TemplateRequirementsStep = ({
    setInput,
    createTemplate,
    input,
    stepperCallback,
}: TemplateRequirementsStepProps) => {
    const onSubmit = async (
        e: FormExtendedEvent<TemplateRequirementsFormType, Element>
    ) => {
        const updatedInput = { ...input, requirements: e.value.requirements }
        setInput(updatedInput)
        await createTemplate(updatedInput)
    }
    return (
        <TemplateRequirementsForm
            input={input}
            submitLabel="Publish"
            onSubmit={onSubmit}
            cancelLabel={'Back'}
            onCancel={() => {
                // Filter out Collateral Token - as this FlexInput is handled by its own
                const filteredFlexInputs = input.flexInputs.filter(
                    (flexInput) => flexInput.id !== 'collateralToken'
                )

                if (filteredFlexInputs.length > 0) {
                    stepperCallback(TEMPLATE_WIZARD_STEPS.FLEX_INPUTS)
                } else {
                    stepperCallback(TEMPLATE_WIZARD_STEPS.PRICING)
                }
            }}
        />
    )
}

export default TemplateRequirementsStep
