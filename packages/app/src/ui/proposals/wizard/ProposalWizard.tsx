import { ProposalInputType, initialProposalInput } from '../EditProposalUI'
import { useContext, useEffect, useState } from 'react'

import { Box } from 'grommet'
import ProposalDescriptionStep from './steps/ProposalDescriptionStep'
import ProposalFlexInputsStep from './steps/ProposalFlexInputsStep'
import ProposalPricingStep from './steps/ProposalPricingStep'
import ProposalPublishStep from './steps/ProposalPublishStep'
import { TopRefContext } from '@cambrian/app/store/TopRefContext'
import { useProposalContext } from '@cambrian/app/hooks/useProposalContext'

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

    const { proposal } = useProposalContext()
    const [proposalInput, setProposalInput] =
        useState<ProposalInputType>(initialProposalInput)

    useEffect(() => {
        if (proposal)
            setProposalInput({
                title: proposal.content.title,
                description: proposal.content.description,
                flexInputs: proposal.content.flexInputs,
                price: proposal.content.price,
            })
    }, [proposal])

    const renderCurrentFormStep = () => {
        switch (currentStep) {
            case PROPOSAL_WIZARD_STEPS.DESCRIPTION:
                return (
                    <ProposalDescriptionStep
                        proposalInput={proposalInput}
                        setProposalInput={setProposalInput}
                        stepperCallback={setCurrentStep}
                    />
                )
            case PROPOSAL_WIZARD_STEPS.PRICING:
                return (
                    <ProposalPricingStep
                        proposalInput={proposalInput}
                        setProposalInput={setProposalInput}
                        stepperCallback={setCurrentStep}
                    />
                )
            case PROPOSAL_WIZARD_STEPS.FLEX_INPUTS:
                return (
                    <ProposalFlexInputsStep
                        proposalInput={proposalInput}
                        setProposalInput={setProposalInput}
                        stepperCallback={setCurrentStep}
                    />
                )
            case PROPOSAL_WIZARD_STEPS.PUBLISH:
                return <ProposalPublishStep />
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
