import { SetStateAction, useContext, useEffect, useState } from 'react'

import { Box } from 'grommet'
import ProposalDescriptionStep from './steps/ProposalDescriptionStep'
import ProposalFlexInputsStep from './steps/ProposalFlexInputsStep'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import ProposalPricingStep from './steps/ProposalPricingStep'
import ProposalPublishStep from './steps/ProposalPublishStep'
import { StageStackType } from '../../dashboard/ProposalsDashboardUI'
import { TopRefContext } from '@cambrian/app/store/TopRefContext'

interface ProposalWizardProps {
    proposalInput: ProposalModel
    setProposalInput: React.Dispatch<SetStateAction<ProposalModel | undefined>>
    onSaveProposal: () => Promise<boolean>
    stageStack: StageStackType
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
    stageStack,
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
                        requirements={stageStack.template.requirements}
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
                        template={stageStack.template}
                    />
                )
            case PROPOSAL_WIZARD_STEPS.FLEX_INPUTS:
                return (
                    <ProposalFlexInputsStep
                        stepperCallback={setCurrentStep}
                        proposalInput={proposalInput}
                        setProposalInput={setProposalInput}
                        onSaveProposal={onSaveProposal}
                        composition={stageStack.composition}
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
            <Box height={{ min: '80vh' }} justify="center" width={'xlarge'}>
                {renderCurrentFormStep()}
            </Box>
        </>
    )
}

export default ProposalWizard
