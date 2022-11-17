import {
    TEMPLATE_WIZARD_STEPS,
    TemplateWizardStepsType,
} from '../TemplateWizard'

import { Box } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { SetStateAction } from 'react'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import TemplateRequirementsForm from '../../forms/TemplateRequirementsForm'

interface TemplateRequirementsStepProps {
    template: TemplateModel
    setTemplate: React.Dispatch<SetStateAction<TemplateModel | undefined>>
    stepperCallback: (step: TemplateWizardStepsType) => void
    onSaveTemplate: () => Promise<boolean>
}

const TemplateRequirementsStep = ({
    template,
    setTemplate,
    stepperCallback,
    onSaveTemplate,
}: TemplateRequirementsStepProps) => {
    return (
        <Box>
            <Box pad="xsmall">
                <HeaderTextSection
                    title="Requirements"
                    paragraph="Information to help buyers provide you with exactly what you need to start working on their order."
                />
            </Box>
            <TemplateRequirementsForm
                template={template}
                setTemplate={setTemplate}
                submitLabel="Save & Finish"
                onSubmit={async () => {
                    if (await onSaveTemplate())
                        stepperCallback(TEMPLATE_WIZARD_STEPS.PUBLISH)
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
