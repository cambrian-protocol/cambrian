import { SetStateAction, useContext, useEffect, useState } from 'react'

import { Box } from 'grommet'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import TemplateDescriptionStep from './steps/TemplateDescriptionStep'
import TemplateFlexInputsStep from './steps/TemplateFlexInputsStep'
import TemplatePricingStep from './steps/TemplatePricingStep'
import TemplatePublishStep from './steps/TemplatePublishStep'
import TemplateRequirementsStep from './steps/TemplateRequirementsStep'
import { TopRefContext } from '@cambrian/app/store/TopRefContext'
import { UserType } from '@cambrian/app/store/UserContext'

interface TemplateWizardProps {
    currentUser: UserType
    templateInput: CeramicTemplateModel
    setTemplateInput: React.Dispatch<
        SetStateAction<CeramicTemplateModel | undefined>
    >
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
    currentUser,
    templateInput,
    setTemplateInput,
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
                        templateInput={templateInput}
                        setTemplateInput={setTemplateInput}
                        stepperCallback={setCurrentStep}
                        onSaveTemplate={onSaveTemplate}
                    />
                )
            case TEMPLATE_WIZARD_STEPS.PRICING:
                return (
                    <TemplatePricingStep
                        templateInput={templateInput}
                        setTemplateInput={setTemplateInput}
                        stepperCallback={setCurrentStep}
                        currentUser={currentUser}
                        onSaveTemplate={onSaveTemplate}
                    />
                )
            case TEMPLATE_WIZARD_STEPS.FLEX_INPUTS:
                return (
                    <TemplateFlexInputsStep
                        templateInput={templateInput}
                        setTemplateInput={setTemplateInput}
                        stepperCallback={setCurrentStep}
                        composition={composition}
                        onSaveTemplate={onSaveTemplate}
                    />
                )
            case TEMPLATE_WIZARD_STEPS.REQUIREMENTS:
                return (
                    <TemplateRequirementsStep
                        templateInput={templateInput}
                        setTemplateInput={setTemplateInput}
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
            <Box height={{ min: '90vh' }} justify="center" pad="large">
                {/* TODO Wizard Nav  */}
                {renderCurrentFormStep()}
            </Box>
        </>
    )
}

export default TemplateWizard
