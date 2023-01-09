import { useContext, useEffect, useState } from 'react'

import { Box } from 'grommet'
import { EditTemplatePropsType } from '@cambrian/app/hooks/useEditTemplate'
import TemplateDescriptionStep from './steps/TemplateDescriptionStep'
import TemplateFlexInputsStep from './steps/TemplateFlexInputsStep'
import TemplatePricingStep from './steps/TemplatePricingStep'
import TemplatePublishStep from './steps/TemplatePublishStep'
import TemplateRequirementsStep from './steps/TemplateRequirementsStep'
import { TopRefContext } from '@cambrian/app/store/TopRefContext'

export enum TEMPLATE_WIZARD_STEPS {
    DESCRIPTION,
    PRICING,
    FLEX_INPUTS,
    REQUIREMENTS,
    PUBLISH,
}
export type TemplateWizardStepsType =
    | TEMPLATE_WIZARD_STEPS.DESCRIPTION
    | TEMPLATE_WIZARD_STEPS.PRICING
    | TEMPLATE_WIZARD_STEPS.FLEX_INPUTS
    | TEMPLATE_WIZARD_STEPS.REQUIREMENTS
    | TEMPLATE_WIZARD_STEPS.PUBLISH

const TemplateWizard = ({
    editTemplateProps: editTemplateProps,
}: {
    editTemplateProps: EditTemplatePropsType
}) => {
    const [currentStep, setCurrentStep] = useState<TemplateWizardStepsType>(
        TEMPLATE_WIZARD_STEPS.DESCRIPTION
    )
    // Scroll up when step changes
    const topRefContext = useContext(TopRefContext)
    useEffect(() => {
        if (topRefContext)
            topRefContext.current?.scrollIntoView({ behavior: 'smooth' })
    }, [currentStep])

    const renderCurrentFormStep = () => {
        switch (currentStep) {
            case TEMPLATE_WIZARD_STEPS.DESCRIPTION:
                return (
                    <TemplateDescriptionStep
                        editTemplateProps={editTemplateProps}
                        stepperCallback={setCurrentStep}
                    />
                )
            case TEMPLATE_WIZARD_STEPS.PRICING:
                return (
                    <TemplatePricingStep
                        editTemplateProps={editTemplateProps}
                        stepperCallback={setCurrentStep}
                    />
                )
            case TEMPLATE_WIZARD_STEPS.FLEX_INPUTS:
                return (
                    <TemplateFlexInputsStep
                        editTemplateProps={editTemplateProps}
                        stepperCallback={setCurrentStep}
                    />
                )
            case TEMPLATE_WIZARD_STEPS.REQUIREMENTS:
                return (
                    <TemplateRequirementsStep
                        editTemplateProps={editTemplateProps}
                        stepperCallback={setCurrentStep}
                    />
                )
            case TEMPLATE_WIZARD_STEPS.PUBLISH:
                return (
                    <TemplatePublishStep
                        editTemplateProps={editTemplateProps}
                    />
                )
            default:
                return <></>
        }
    }

    return (
        <>
            <Box height={{ min: '80vh' }} justify="center">
                {/* TODO Wizard Nav  */}
                {renderCurrentFormStep()}
            </Box>
        </>
    )
}

export default TemplateWizard
