import {
    TEMPLATE_WIZARD_STEPS,
    TemplateFormType,
    TemplateWizardStepsType,
} from '../TemplateWizard'
import TemplateDescriptionForm, {
    TemplateDescriptionFormType,
} from '../../forms/TemplateDescriptionForm'

import { FormExtendedEvent } from 'grommet'
import { SetStateAction } from 'react'
import router from 'next/router'

interface TemplateDescriptionStepProps {
    stepperCallback: (step: TemplateWizardStepsType) => void
    input: TemplateFormType
    setInput: React.Dispatch<SetStateAction<TemplateFormType>>
}

const TemplateDescriptionStep = ({
    input,
    setInput,
    stepperCallback,
}: TemplateDescriptionStepProps) => {
    const onSubmit = async (
        e: FormExtendedEvent<TemplateDescriptionFormType, Element>
    ) => {
        e.preventDefault()
        const updatedInput = {
            ...input,
            title: e.value.title,
            description: e.value.description,
        }
        setInput(updatedInput)
        stepperCallback(TEMPLATE_WIZARD_STEPS.PRICING)
    }

    return (
        <TemplateDescriptionForm
            onSubmit={onSubmit}
            input={input}
            submitLabel={'Continue'}
            onCancel={() => router.back()}
            cancelLabel={'Cancel'}
        />
    )
}

export default TemplateDescriptionStep
