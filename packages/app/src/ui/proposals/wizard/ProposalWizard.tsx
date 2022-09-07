import { SetStateAction, useContext, useEffect, useState } from 'react'

import { Box } from 'grommet'
import ProposalDescriptionStep from './steps/ProposalDescriptionStep'
import { ProposalDocsStackType } from '@cambrian/app/store/ProposalContext'
import ProposalFlexInputsStep from './steps/ProposalFlexInputsStep'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import ProposalPricingStep from './steps/ProposalPricingStep'
import ProposalPublishStep from './steps/ProposalPublishStep'
import { TopRefContext } from '@cambrian/app/store/TopRefContext'

interface ProposalWizardProps {
    proposalInput: ProposalModel
    setProposalInput: React.Dispatch<SetStateAction<ProposalModel | undefined>>
    onSaveProposal: () => Promise<boolean>
    proposalDocStack: ProposalDocsStackType
    proposalStreamID: string
}

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

const ProposalWizard = ({
    proposalInput,
    setProposalInput,
    onSaveProposal,
    proposalDocStack,
    proposalStreamID,
}: ProposalWizardProps) => {
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
                    <ProposalDescriptionStep
                        requirements={
                            proposalDocStack.templateDoc.content.requirements
                        }
                        stepperCallback={setCurrentStep}
                        proposalInput={proposalInput}
                        setProposalInput={setProposalInput}
                        onSaveProposal={onSaveProposal}
                    />
                )
            case PROPOSAL_WIZARD_STEPS.PRICING:
                return (
                    <ProposalPricingStep
                        stepperCallback={setCurrentStep}
                        proposalInput={proposalInput}
                        setProposalInput={setProposalInput}
                        onSaveProposal={onSaveProposal}
                        template={proposalDocStack.templateDoc.content}
                    />
                )
            case PROPOSAL_WIZARD_STEPS.FLEX_INPUTS:
                return (
                    <ProposalFlexInputsStep
                        stepperCallback={setCurrentStep}
                        proposalInput={proposalInput}
                        setProposalInput={setProposalInput}
                        onSaveProposal={onSaveProposal}
                        composition={proposalDocStack.compositionDoc.content}
                    />
                )
            case PROPOSAL_WIZARD_STEPS.PUBLISH:
                return (
                    <ProposalPublishStep proposalStreamID={proposalStreamID} />
                )
            default:
                return <></>
        }
    }

    return (
        <>
            <Box height={{ min: '90vh' }} justify="center" width={'xlarge'}>
                {renderCurrentFormStep()}
            </Box>
        </>
    )
}

export default ProposalWizard
