import {
    TEMPLATE_WIZARD_STEPS,
    TemplateWizardStepsType,
} from '../TemplateWizard'

import { Box } from 'grommet'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { SetStateAction } from 'react'
import TemplatePricingForm from '../../forms/TemplatePricingForm'
import { UserType } from '@cambrian/app/store/UserContext'

interface TemplatePricingStepProps {
    currentUser: UserType
    stepperCallback: (step: TemplateWizardStepsType) => void
    templateInput: CeramicTemplateModel
    setTemplateInput: React.Dispatch<
        SetStateAction<CeramicTemplateModel | undefined>
    >
    onSaveTemplate: () => Promise<void>
}

const TemplatePricingStep = ({
    stepperCallback,
    currentUser,
    templateInput,
    setTemplateInput,
    onSaveTemplate,
}: TemplatePricingStepProps) => {
    return (
        <Box height={{ min: '60vh' }}>
            <HeaderTextSection
                title="How much does it cost?"
                paragraph="If the price is variable, provide a baseline. It can be negotiated with customers later."
            />
            <TemplatePricingForm
                templateInput={templateInput}
                setTemplateInput={setTemplateInput}
                onSubmit={async () => {
                    await onSaveTemplate()

                    if (templateInput.flexInputs.length > 0) {
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
                currentUser={currentUser}
            />
        </Box>
    )
}

export default TemplatePricingStep
