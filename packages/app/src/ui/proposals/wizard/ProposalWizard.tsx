import { useContext, useEffect, useState } from 'react'

import { Box } from 'grommet'
import ProposalDescriptionStep from './steps/ProposalDescriptionStep'
import ProposalFlexInputsStep from './steps/ProposalFlexInputsStep'
import ProposalPricingStep from './steps/ProposalPricingStep'
import ProposalPublishStep from './steps/ProposalPublishStep'
import { TopRefContext } from '@cambrian/app/store/TopRefContext'

export enum PROPOSAL_WIZARD_STEPS {
    DESCRIPTION,
    PRICING,
    FLEX_INPUTS,
    PUBLISH,
}

export type ProposalWizardStepsType =
    | PROPOSAL_WIZARD_STEPS.DESCRIPTION
    | PROPOSAL_WIZARD_STEPS.PRICING
    | PROPOSAL_WIZARD_STEPS.FLEX_INPUTS
    | PROPOSAL_WIZARD_STEPS.PUBLISH

const ProposalWizard = () => {
    const [currentStep, setCurrentStep] = useState<ProposalWizardStepsType>(
        PROPOSAL_WIZARD_STEPS.DESCRIPTION
    )
    // Scroll up when step changes
    const topRefContext = useContext(TopRefContext)
    useEffect(() => {
        if (topRefContext)
            topRefContext.current?.scrollIntoView({ behavior: 'smooth' })
    }, [currentStep])

    const renderCurrentFormStep = () => {
        switch (currentStep) {
            case PROPOSAL_WIZARD_STEPS.DESCRIPTION:
                return (
                    <ProposalDescriptionStep stepperCallback={setCurrentStep} />
                )
            /*   case PROPOSAL_WIZARD_STEPS.PRICING:
                return (
                    <ProposalPricingStep
                        stepperCallback={setCurrentStep}
                    />
                )
            case PROPOSAL_WIZARD_STEPS.FLEX_INPUTS:
                return (
                    <ProposalFlexInputsStep
                        stepperCallback={setCurrentStep}
                    />
                )
            case PROPOSAL_WIZARD_STEPS.PUBLISH:
                return (
                    <ProposalPublishStep
                    />
                ) */
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

export default ProposalWizard
