import {
    TEMPLATE_WIZARD_STEPS,
    TemplateWizardStepsType,
} from '../TemplateWizard'
import TemplateRequirementsForm, {
    TemplateRequirementsFormType,
} from '../../forms/TemplateRequirementsForm'

import { Box } from 'grommet'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { SetStateAction } from 'react'

interface TemplateRequirementsStepProps {
    templateInput: CeramicTemplateModel
    setTemplateInput: React.Dispatch<
        SetStateAction<CeramicTemplateModel | undefined>
    >
    stepperCallback: (step: TemplateWizardStepsType) => void
    onSaveTemplate: () => Promise<void>
}

const TemplateRequirementsStep = ({
    templateInput,
    setTemplateInput,
    stepperCallback,
    onSaveTemplate,
}: TemplateRequirementsStepProps) => {
    return (
        <Box height={{ min: '60vh' }}>
            <HeaderTextSection
                title="Requirements"
                paragraph="Information to help buyers provide you with exactly what you need to start working on their order."
            />
            <TemplateRequirementsForm
                templateInput={templateInput}
                setTemplateInput={setTemplateInput}
                submitLabel="Save & Continue"
                onSubmit={async () => {
                    await onSaveTemplate()
                    stepperCallback(TEMPLATE_WIZARD_STEPS.PUBLISH)
                }}
                cancelLabel={'Back'}
                onCancel={() => {
                    if (templateInput.flexInputs.length > 0) {
                        stepperCallback(TEMPLATE_WIZARD_STEPS.FLEX_INPUTS)
                    } else {
                        stepperCallback(TEMPLATE_WIZARD_STEPS.PRICING)
                    }
                }}
            />
        </Box>
    )
}

export default TemplateRequirementsStep
