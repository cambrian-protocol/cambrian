import {
    TEMPLATE_WIZARD_STEPS,
    TemplateWizardStepsType,
} from '../TemplateWizard'

import { Box } from 'grommet'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { SetStateAction } from 'react'
import TemplateDescriptionForm from '../../forms/TemplateDescriptionForm'
import router from 'next/router'

interface TemplateDescriptionStepProps {
    templateInput: CeramicTemplateModel
    setTemplateInput: React.Dispatch<
        SetStateAction<CeramicTemplateModel | undefined>
    >
    stepperCallback: (step: TemplateWizardStepsType) => void
    onSaveTemplate: () => Promise<boolean>
}

const TemplateDescriptionStep = ({
    stepperCallback,
    templateInput,
    setTemplateInput,
    onSaveTemplate,
}: TemplateDescriptionStepProps) => {
    return (
        <Box>
            <Box pad="xsmall">
                <HeaderTextSection
                    title={`What service are you offering?`}
                    paragraph="Let the world know how you can help."
                />
            </Box>
            <TemplateDescriptionForm
                templateInput={templateInput}
                setTemplateInput={setTemplateInput}
                onSubmit={async () => {
                    if (await onSaveTemplate())
                        stepperCallback(TEMPLATE_WIZARD_STEPS.PRICING)
                }}
                submitLabel="Save & Continue"
                onCancel={() =>
                    router.push(`${window.location.origin}/dashboard/templates`)
                }
                cancelLabel="Cancel"
            />
        </Box>
    )
}

export default TemplateDescriptionStep
