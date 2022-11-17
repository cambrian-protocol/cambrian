import {
    TEMPLATE_WIZARD_STEPS,
    TemplateWizardStepsType,
} from '../TemplateWizard'

import { Box } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { SetStateAction } from 'react'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import TemplatePricingForm from '../../forms/TemplatePricingForm'

interface TemplatePricingStepProps {
    stepperCallback: (step: TemplateWizardStepsType) => void
    template: TemplateModel
    setTemplate: React.Dispatch<SetStateAction<TemplateModel | undefined>>
    onSaveTemplate: () => Promise<boolean>
}

const TemplatePricingStep = ({
    stepperCallback,
    template,
    setTemplate,
    onSaveTemplate,
}: TemplatePricingStepProps) => {
    return (
        <Box>
            <Box pad="xsmall">
                <HeaderTextSection
                    title="How much does it cost?"
                    paragraph="If the price is variable, provide a baseline. It can be negotiated with customers later."
                />
            </Box>
            <TemplatePricingForm
                template={template}
                setTemplate={setTemplate}
                onSubmit={async () => {
                    if (await onSaveTemplate()) {
                        if (template.flexInputs.length > 0) {
                            stepperCallback(TEMPLATE_WIZARD_STEPS.FLEX_INPUTS)
                        } else {
                            stepperCallback(TEMPLATE_WIZARD_STEPS.REQUIREMENTS)
                        }
                    }
                }}
                submitLabel="Save & Continue"
                onCancel={() =>
                    stepperCallback(TEMPLATE_WIZARD_STEPS.DESCRIPTION)
                }
                cancelLabel="Back"
            />
        </Box>
    )
}

export default TemplatePricingStep
