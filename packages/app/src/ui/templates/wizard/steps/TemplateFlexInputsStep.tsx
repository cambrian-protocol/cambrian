import {
    TEMPLATE_WIZARD_STEPS,
    TemplateWizardStepsType,
} from '../TemplateWizard'

import { Box } from 'grommet'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { SetStateAction } from 'react'
import TemplateFlexInputsForm from '../../forms/TemplateFlexInputsForm'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import useEditTemplate from '@cambrian/app/hooks/useEditTemplate'

interface TemplateFlexInputsStepProps {
    stepperCallback: (step: TemplateWizardStepsType) => void
}

const TemplateFlexInputsStep = ({
    stepperCallback,
}: TemplateFlexInputsStepProps) => {
    const { onSaveTemplate } = useEditTemplate()

    return (
        <Box>
            <Box pad="xsmall">
                <HeaderTextSection
                    title="Solver Config"
                    paragraph="Configure the Solver by completing these fields as instructed."
                />
            </Box>
            <TemplateFlexInputsForm
                onSubmit={async () => {
                    if (await onSaveTemplate())
                        stepperCallback(TEMPLATE_WIZARD_STEPS.REQUIREMENTS)
                }}
                submitLabel="Save & Continue"
                onCancel={() => stepperCallback(TEMPLATE_WIZARD_STEPS.PRICING)}
                cancelLabel="Back"
            />
        </Box>
    )
}

export default TemplateFlexInputsStep
