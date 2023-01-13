import {
    TEMPLATE_WIZARD_STEPS,
    TemplateWizardStepsType,
} from '../TemplateWizard'

import { Box } from 'grommet'
import { EditTemplatePropsType } from '@cambrian/app/hooks/useEditTemplate'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import TemplateFlexInputsForm from '../../forms/TemplateFlexInputsForm'

interface TemplateFlexInputsStepProps {
    editTemplateProps: EditTemplatePropsType
    stepperCallback: (step: TemplateWizardStepsType) => void
}

const TemplateFlexInputsStep = ({
    editTemplateProps,
    stepperCallback,
}: TemplateFlexInputsStepProps) => {
    const { onSaveTemplate } = editTemplateProps

    return (
        <Box>
            <Box pad="xsmall">
                <HeaderTextSection
                    title="Solver Config"
                    paragraph="Configure the Solver by completing these fields as instructed."
                />
            </Box>
            <TemplateFlexInputsForm
                editTemplateProps={editTemplateProps}
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
