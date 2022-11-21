import {
    TEMPLATE_WIZARD_STEPS,
    TemplateWizardStepsType,
} from '../TemplateWizard'

import { Box } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import TemplateDescriptionForm from '../../forms/TemplateDescriptionForm'
import router from 'next/router'
import { EditTemplateContextType } from '@cambrian/app/hooks/useEditTemplate'

interface TemplateDescriptionStepProps {
    editTemplateContext: EditTemplateContextType
    stepperCallback: (step: TemplateWizardStepsType) => void
}

const TemplateDescriptionStep = ({
    editTemplateContext,
    stepperCallback,
}: TemplateDescriptionStepProps) => {
    const { onSaveTemplate } = editTemplateContext

    return (
        <Box>
            <Box pad="xsmall">
                <HeaderTextSection
                    title={`What service are you offering?`}
                    paragraph="Let the world know how you can help."
                />
            </Box>
            <TemplateDescriptionForm
                editTemplateContext={editTemplateContext}
                onSubmit={async () => {
                    if (await onSaveTemplate())
                        stepperCallback(TEMPLATE_WIZARD_STEPS.PRICING)
                }}
                submitLabel="Save & Continue"
                onCancel={() =>
                    router.push(`${window.location.origin}/dashboard?idx=1`)
                }
                cancelLabel="Cancel"
            />
        </Box>
    )
}

export default TemplateDescriptionStep
