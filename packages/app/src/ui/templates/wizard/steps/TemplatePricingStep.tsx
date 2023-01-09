import {
    TEMPLATE_WIZARD_STEPS,
    TemplateWizardStepsType,
} from '../TemplateWizard'

import { Box } from 'grommet'
import { EditTemplatePropsType } from '@cambrian/app/hooks/useEditTemplate'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import TemplatePricingForm from '../../forms/TemplatePricingForm'

interface TemplatePricingStepProps {
    editTemplateProps: EditTemplatePropsType
    stepperCallback: (step: TemplateWizardStepsType) => void
}

const TemplatePricingStep = ({
    editTemplateProps,
    stepperCallback,
}: TemplatePricingStepProps) => {
    const { template, onSaveTemplate } = editTemplateProps

    if (!template) {
        return null
    }
    return (
        <Box>
            <Box pad="xsmall">
                <HeaderTextSection
                    title="How much does it cost?"
                    paragraph="If the price is variable, provide a baseline. It can be negotiated with customers later."
                />
            </Box>
            <TemplatePricingForm
                editTemplateProps={editTemplateProps}
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
