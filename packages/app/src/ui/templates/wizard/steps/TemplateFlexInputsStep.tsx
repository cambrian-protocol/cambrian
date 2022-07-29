import {
    TEMPLATE_WIZARD_STEPS,
    TemplateWizardStepsType,
} from '../TemplateWizard'

import { Box } from 'grommet'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { SetStateAction } from 'react'
import TemplateFlexInputsForm from '../../forms/TemplateFlexInputsForm'

interface TemplateFlexInputsStepProps {
    templateInput: CeramicTemplateModel
    setTemplateInput: React.Dispatch<
        SetStateAction<CeramicTemplateModel | undefined>
    >
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
                    paragraph="These fields configure the Solver for you and your service. Leave blank those which should be completed by a customer (e.g. 'Client Address')"
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
