import { TemplateInputType, initialTemplateInput } from '../EditTemplateUI'
import { useContext, useEffect, useState } from 'react'

import { Box } from 'grommet'
import TemplateDescriptionStep from './steps/TemplateDescriptionStep'
import TemplateFlexInputsStep from './steps/TemplateFlexInputsStep'
import TemplatePricingStep from './steps/TemplatePricingStep'
import TemplatePublishStep from './steps/TemplatePublishStep'
import TemplateRequirementsStep from './steps/TemplateRequirementsStep'
import { TopRefContext } from '@cambrian/app/store/TopRefContext'
import _ from 'lodash'
import { useTemplateContext } from '@cambrian/app/hooks/useTemplateContext'

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

const TemplateWizard = () => {
    const [currentStep, setCurrentStep] = useState<TemplateWizardStepsType>(
        TEMPLATE_WIZARD_STEPS.DESCRIPTION
    )
    // Scroll up when step changes
    const topRefContext = useContext(TopRefContext)
    useEffect(() => {
        if (topRefContext)
            topRefContext.current?.scrollIntoView({ behavior: 'smooth' })
    }, [currentStep])

    const { template } = useTemplateContext()
    const [templateInput, setTemplateInput] =
        useState<TemplateInputType>(initialTemplateInput)

    useEffect(() => {
        if (template)
            setTemplateInput({
                title: template.content.title,
                description: template.content.description,
                flexInputs: template.content.flexInputs,
                price: template.content.price,
                requirements: template.content.requirements,
            })
    }, [template])

    const onSave = async () => {
        if (template) {
            const updatedTemplate = {
                ...template.content,
                ...templateInput,
            }
            if (!_.isEqual(updatedTemplate, template.content)) {
                try {
                    await template.updateContent(updatedTemplate)
                } catch (e) {
                    console.error(e)
                }
            }
        }
    }

    const renderCurrentFormStep = () => {
        switch (currentStep) {
            case TEMPLATE_WIZARD_STEPS.DESCRIPTION:
                return (
                    <TemplateDescriptionStep
                        templateInput={templateInput}
                        setTemplateInput={setTemplateInput}
                        onSave={async () => {
                            await onSave()
                            setCurrentStep(TEMPLATE_WIZARD_STEPS.PRICING)
                        }}
                    />
                )
            case TEMPLATE_WIZARD_STEPS.PRICING:
                return (
                    <TemplatePricingStep
                        templateInput={templateInput}
                        setTemplateInput={setTemplateInput}
                        onSave={async () => {
                            await onSave()
                            if (templateInput.flexInputs.length > 0) {
                                setCurrentStep(
                                    TEMPLATE_WIZARD_STEPS.FLEX_INPUTS
                                )
                            } else {
                                setCurrentStep(
                                    TEMPLATE_WIZARD_STEPS.REQUIREMENTS
                                )
                            }
                        }}
                        onBack={() =>
                            setCurrentStep(TEMPLATE_WIZARD_STEPS.DESCRIPTION)
                        }
                    />
                )
            case TEMPLATE_WIZARD_STEPS.FLEX_INPUTS:
                return (
                    <TemplateFlexInputsStep
                        templateInput={templateInput}
                        setTemplateInput={setTemplateInput}
                        onSave={async () => {
                            await onSave()
                            setCurrentStep(TEMPLATE_WIZARD_STEPS.REQUIREMENTS)
                        }}
                        onBack={() =>
                            setCurrentStep(TEMPLATE_WIZARD_STEPS.PRICING)
                        }
                    />
                )
            case TEMPLATE_WIZARD_STEPS.REQUIREMENTS:
                return (
                    <TemplateRequirementsStep
                        templateInput={templateInput}
                        setTemplateInput={setTemplateInput}
                        onSave={async () => {
                            await onSave()
                            setCurrentStep(TEMPLATE_WIZARD_STEPS.PUBLISH)
                        }}
                        onBack={() => {
                            if (templateInput.flexInputs.length > 0) {
                                setCurrentStep(
                                    TEMPLATE_WIZARD_STEPS.FLEX_INPUTS
                                )
                            } else {
                                setCurrentStep(TEMPLATE_WIZARD_STEPS.PRICING)
                            }
                        }}
                    />
                )
            case TEMPLATE_WIZARD_STEPS.PUBLISH:
                return <TemplatePublishStep />
            default:
                return <></>
        }
    }

    return (
        <Box align="center">
            <Box height={{ min: '80vh' }} justify="center" width={'xlarge'}>
                {/* TODO Wizard Nav  */}
                {renderCurrentFormStep()}
            </Box>
        </Box>
    )
}

export default TemplateWizard
