import {
    TEMPLATE_WIZARD_STEPS,
    TemplateWizardStepsType,
} from '../TemplateWizard'

import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'
import { Box } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import TemplatePricingForm from '../../forms/TemplatePricingForm'
import { useTemplateContext } from '@cambrian/app/hooks/useTemplateContext'

interface TemplatePricingStepProps {
    stepperCallback: (step: TemplateWizardStepsType) => void
}

const TemplatePricingStep = ({ stepperCallback }: TemplatePricingStepProps) => {
    const { template } = useTemplateContext()

    return (
        <Box>
            <HeaderTextSection
                title="How much does it cost?"
                paragraph="If the price is variable, provide a baseline. It can be negotiated with customers later."
            />
            {template ? (
                <TemplatePricingForm
                    template={template}
                    onSubmit={async () => {
                        if (template.content.flexInputs.length > 0) {
                            stepperCallback(TEMPLATE_WIZARD_STEPS.FLEX_INPUTS)
                        } else {
                            stepperCallback(TEMPLATE_WIZARD_STEPS.REQUIREMENTS)
                        }
                    }}
                    submitLabel="Save & Continue"
                    onCancel={() =>
                        stepperCallback(TEMPLATE_WIZARD_STEPS.DESCRIPTION)
                    }
                    cancelLabel="Back"
                />
            ) : (
                <Box height="large" gap="medium">
                    <BaseSkeletonBox height={'xxsmall'} width={'100%'} />
                    <BaseSkeletonBox height={'small'} width={'100%'} />
                </Box>
            )}
        </Box>
    )
}

export default TemplatePricingStep
