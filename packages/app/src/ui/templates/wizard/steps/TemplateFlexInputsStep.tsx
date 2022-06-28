import {
    TEMPLATE_WIZARD_STEPS,
    TemplateFormType,
    TemplateWizardStepsType,
} from '../TemplateWizard'
import TemplateFlexInputsForm, {
    TemplateFlexInputStepFormType,
} from '../../forms/TemplateFlexInputsForm'

import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { FormExtendedEvent } from 'grommet'
import { SetStateAction } from 'react'

interface TemplateFlexInputsStepProps {
    stepperCallback: (step: TemplateWizardStepsType) => void
    input: TemplateFormType
    setInput: React.Dispatch<SetStateAction<TemplateFormType>>
    composition: CompositionModel
}

const TemplateFlexInputsStep = ({
    input,
    stepperCallback,
    setInput,
    composition,
}: TemplateFlexInputsStepProps) => {
    const onSubmit = async (
        e: FormExtendedEvent<TemplateFlexInputStepFormType, Element>
    ) => {
        e.preventDefault()
        const updatedInput = { ...input, flexInputs: e.value.flexInputs }
        setInput(updatedInput)
        stepperCallback(TEMPLATE_WIZARD_STEPS.REQUIREMENTS)
    }

    return (
        <TemplateFlexInputsForm
            composition={composition}
            input={input}
            onSubmit={onSubmit}
            submitLabel={'Continue'}
            cancelLabel={'Back'}
            onCancel={() => stepperCallback(TEMPLATE_WIZARD_STEPS.PRICING)}
        />
    )
}

export default TemplateFlexInputsStep
