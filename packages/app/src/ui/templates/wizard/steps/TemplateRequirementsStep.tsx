import {
    TEMPLATE_WIZARD_STEPS,
    TemplateWizardStepsType,
} from '../TemplateWizard'

import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'
import { Box } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import TemplateRequirementsForm from '../../forms/TemplateRequirementsForm'
import { useTemplateContext } from '@cambrian/app/hooks/useTemplateContext'

interface TemplateRequirementsStepProps {
    stepperCallback: (step: TemplateWizardStepsType) => void
}

const TemplateRequirementsStep = ({
    stepperCallback,
}: TemplateRequirementsStepProps) => {
    const { template } = useTemplateContext()

    return (
        <Box>
            <HeaderTextSection
                title="Requirements"
                paragraph="Information to help buyers provide you with exactly what you need to start working on their order."
            />
            {template ? (
                <TemplateRequirementsForm
                    template={template}
                    submitLabel="Save & Finish"
                    onSubmit={() =>
                        stepperCallback(TEMPLATE_WIZARD_STEPS.PUBLISH)
                    }
                    cancelLabel={'Back'}
                    onCancel={() => {
                        if (template.content.flexInputs.length > 0) {
                            stepperCallback(TEMPLATE_WIZARD_STEPS.FLEX_INPUTS)
                        } else {
                            stepperCallback(TEMPLATE_WIZARD_STEPS.PRICING)
                        }
                    }}
                />
            ) : (
                <Box height="medium" gap="medium">
                    <BaseSkeletonBox height={'xxsmall'} width={'100%'} />
                    <BaseSkeletonBox height={'small'} width={'100%'} />
                </Box>
            )}
        </Box>
    )
}

export default TemplateRequirementsStep
