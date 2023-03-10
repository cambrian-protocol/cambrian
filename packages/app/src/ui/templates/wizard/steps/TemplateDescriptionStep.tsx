import {
    TEMPLATE_WIZARD_STEPS,
    TemplateWizardStepsType,
} from '../TemplateWizard'

import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'
import { Box } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import TemplateDescriptionForm from '../../forms/TemplateDescriptionForm'
import router from 'next/router'
import { useTemplateContext } from '@cambrian/app/hooks/useTemplateContext'

interface TemplateDescriptionStepProps {
    stepperCallback: (step: TemplateWizardStepsType) => void
}

const TemplateDescriptionStep = ({
    stepperCallback,
}: TemplateDescriptionStepProps) => {
    const { template } = useTemplateContext()

    return (
        <Box>
            <HeaderTextSection
                title={`What service are you offering?`}
                paragraph="Let the world know how you can help."
            />
            {template ? (
                <TemplateDescriptionForm
                    template={template}
                    onSubmit={() =>
                        stepperCallback(TEMPLATE_WIZARD_STEPS.PRICING)
                    }
                    submitLabel="Save & Continue"
                    onCancel={() =>
                        router.push(`${window.location.origin}/dashboard?idx=1`)
                    }
                    cancelLabel="Cancel"
                />
            ) : (
                <Box height="large" gap="medium">
                    <BaseSkeletonBox height={'xxsmall'} width={'100%'} />
                    <BaseSkeletonBox height={'small'} width={'100%'} />
                </Box>
            )}
        </Box>
    )
}

export default TemplateDescriptionStep
