import {
    TEMPLATE_WIZARD_STEPS,
    TemplateWizardStepsType,
} from '../TemplateWizard'

import { Box } from 'grommet'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { SetStateAction } from 'react'
import TemplatePricingForm from '../../forms/TemplatePricingForm'

interface TemplatePricingStepProps {
    stepperCallback: (step: TemplateWizardStepsType) => void
    templateInput: CeramicTemplateModel
    setTemplateInput: React.Dispatch<
        SetStateAction<CeramicTemplateModel | undefined>
    >
    onSaveTemplate: () => Promise<boolean>
}

const TemplatePricingStep = ({
    stepperCallback,
    templateInput,
    setTemplateInput,
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
                templateInput={templateInput}
                setTemplateInput={setTemplateInput}
                onSubmit={async () => {
                    if (await onSaveTemplate()) {
                        if (templateInput.flexInputs.length > 0) {
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
