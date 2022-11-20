import {
    TEMPLATE_WIZARD_STEPS,
    TemplateWizardStepsType,
} from '../TemplateWizard'

import { Box } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { SetStateAction } from 'react'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import TemplateRequirementsForm from '../../forms/TemplateRequirementsForm'
import useEditTemplate from '@cambrian/app/hooks/useEditTemplate'

interface TemplateRequirementsStepProps {
    stepperCallback: (step: TemplateWizardStepsType) => void
}

const TemplateRequirementsStep = ({
    stepperCallback,
}: TemplateRequirementsStepProps) => {
    const { template, onSaveTemplate } = useEditTemplate()

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
                submitLabel="Save & Finish"
                onSubmit={async () => {
                    if ((await onSaveTemplate()) == true) {
                        console.log('calling back')
                        stepperCallback(TEMPLATE_WIZARD_STEPS.PUBLISH)
                    } else {
                        console.log('nope')
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
