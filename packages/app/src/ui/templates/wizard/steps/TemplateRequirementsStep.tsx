import {
    TEMPLATE_WIZARD_STEPS,
    TemplateWizardStepsType,
} from '../TemplateWizard'

import { Box } from 'grommet'
import { EditTemplatePropsType } from '@cambrian/app/hooks/useEditTemplate'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import TemplateRequirementsForm from '../../forms/TemplateRequirementsForm'

interface TemplateRequirementsStepProps {
    editTemplateProps: EditTemplatePropsType
    stepperCallback: (step: TemplateWizardStepsType) => void
}

const TemplateRequirementsStep = ({
    editTemplateProps,
    stepperCallback,
}: TemplateRequirementsStepProps) => {
    const { template, onSaveTemplate } = editTemplateProps

    if (!template) {
        return null
    }
    return (
        <Box>
            <Box pad="xsmall">
                <HeaderTextSection
                    title="Requirements"
                    paragraph="Information to help buyers provide you with exactly what you need to start working on their order."
                />
            </Box>
            <TemplateRequirementsForm
                editTemplateProps={editTemplateProps}
                submitLabel="Save & Finish"
                onSubmit={async () => {
                    if ((await onSaveTemplate()) == true) {
                        stepperCallback(TEMPLATE_WIZARD_STEPS.PUBLISH)
                    }
                }}
                cancelLabel={'Back'}
                onCancel={() => {
                    if (template.flexInputs.length > 0) {
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
