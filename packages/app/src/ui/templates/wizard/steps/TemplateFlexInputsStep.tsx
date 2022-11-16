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

interface TemplateFlexInputsStepProps {
    templateInput: TemplateModel
    setTemplateInput: React.Dispatch<SetStateAction<TemplateModel | undefined>>
    stepperCallback: (step: TemplateWizardStepsType) => void
    composition: CompositionModel
    onSaveTemplate: () => Promise<boolean>
}

const TemplateFlexInputsStep = ({
    stepperCallback,
    templateInput,
    setTemplateInput,
    onSaveTemplate,
    composition,
}: TemplateFlexInputsStepProps) => {
    return (
        <Box>
            <Box pad="xsmall">
                <HeaderTextSection
                    title="Solver Config"
                    paragraph="Configure the Solver by completing these fields as instructed."
                />
            </Box>
            <TemplateFlexInputsForm
                composition={composition}
                templateInput={templateInput}
                setTemplateInput={setTemplateInput}
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
