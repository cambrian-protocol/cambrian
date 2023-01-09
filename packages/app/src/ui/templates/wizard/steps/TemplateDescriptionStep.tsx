import {
    TEMPLATE_WIZARD_STEPS,
    TemplateWizardStepsType,
} from '../TemplateWizard'

import { Box } from 'grommet'
import { EditTemplatePropsType } from '@cambrian/app/hooks/useEditTemplate'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import TemplateDescriptionForm from '../../forms/TemplateDescriptionForm'
import router from 'next/router'

interface TemplateDescriptionStepProps {
    editTemplateProps: EditTemplatePropsType
    stepperCallback: (step: TemplateWizardStepsType) => void
}

const TemplateDescriptionStep = ({
    editTemplateProps,
    stepperCallback,
}: TemplateDescriptionStepProps) => {
    const { onSaveTemplate } = editTemplateProps

    return (
        <Box>
            <Box pad="xsmall">
                <HeaderTextSection
                    title={`What service are you offering?`}
                    paragraph="Let the world know how you can help."
                />
            </Box>
            <TemplateDescriptionForm
                editTemplateProps={editTemplateProps}
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
