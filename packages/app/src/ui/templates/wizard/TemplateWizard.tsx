import { SetStateAction, useContext, useEffect, useState } from 'react'

import { Box } from 'grommet'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import TemplateDescriptionStep from './steps/TemplateDescriptionStep'
import TemplateFlexInputsStep from './steps/TemplateFlexInputsStep'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import TemplatePricingStep from './steps/TemplatePricingStep'
import TemplatePublishStep from './steps/TemplatePublishStep'
import TemplateRequirementsStep from './steps/TemplateRequirementsStep'
import { TopRefContext } from '@cambrian/app/store/TopRefContext'
import { UserType } from '@cambrian/app/store/UserContext'

interface TemplateWizardProps {
    template: TemplateModel
    setTemplate: React.Dispatch<SetStateAction<TemplateModel | undefined>>
    templateStreamID: string
    onSaveTemplate: () => Promise<boolean>
    composition: CompositionModel
}

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
    template,
    setTemplate,
    templateStreamID,
    onSaveTemplate,
    composition,
}: TemplateWizardProps) => {
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
                        template={template}
                        setTemplate={setTemplate}
                        stepperCallback={setCurrentStep}
                        onSaveTemplate={onSaveTemplate}
                    />
                )
            case TEMPLATE_WIZARD_STEPS.PRICING:
                return (
                    <TemplatePricingStep
                        template={template}
                        setTemplate={setTemplate}
                        stepperCallback={setCurrentStep}
                        onSaveTemplate={onSaveTemplate}
                    />
                )
            case TEMPLATE_WIZARD_STEPS.FLEX_INPUTS:
                return (
                    <TemplateFlexInputsStep
                        template={template}
                        setTemplate={setTemplate}
                        stepperCallback={setCurrentStep}
                        composition={composition}
                        onSaveTemplate={onSaveTemplate}
                    />
                )
            case TEMPLATE_WIZARD_STEPS.REQUIREMENTS:
                return (
                    <TemplateRequirementsStep
                        template={template}
                        setTemplate={setTemplate}
                        stepperCallback={setCurrentStep}
                        onSaveTemplate={onSaveTemplate}
                    />
                )
            case TEMPLATE_WIZARD_STEPS.PUBLISH:
                return (
                    <TemplatePublishStep templateStreamID={templateStreamID} />
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
