import { SetStateAction, useContext, useEffect, useState } from 'react'

import { Box } from 'grommet'
import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import ProposalDescriptionStep from './steps/ProposalDescriptionStep'
import ProposalFlexInputsStep from './steps/ProposalFlexInputsStep'
import ProposalPricingStep from './steps/ProposalPricingStep'
import ProposalPublishStep from './steps/ProposalPublishStep'
import { TopRefContext } from '@cambrian/app/store/TopRefContext'
import { UserType } from '@cambrian/app/store/UserContext'

interface ProposalWizardProps {
    currentUser: UserType
    proposalInput: CeramicProposalModel
    composition: CompositionModel
    template: CeramicTemplateModel
    setProposalInput: React.Dispatch<
        SetStateAction<CeramicProposalModel | undefined>
    >
    onSaveProposal: () => Promise<void>
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
    currentUser,
    proposalInput,
    setProposalInput,
    onSaveProposal,
    template,
    composition,
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
                        proposalInput={proposalInput}
                        setProposalInput={setProposalInput}
                        stepperCallback={setCurrentStep}
                        onSaveProposal={onSaveProposal}
                    />
                )
            case PROPOSAL_WIZARD_STEPS.PRICING:
                return (
                    <ProposalPricingStep
                        currentUser={currentUser}
                        template={template}
                        proposalInput={proposalInput}
                        setProposalInput={setProposalInput}
                        stepperCallback={setCurrentStep}
                        onSaveProposal={onSaveProposal}
                    />
                )
            case PROPOSAL_WIZARD_STEPS.FLEX_INPUTS:
                return (
                    <ProposalFlexInputsStep
                        composition={composition}
                        proposalInput={proposalInput}
                        setProposalInput={setProposalInput}
                        stepperCallback={setCurrentStep}
                        onSaveProposal={onSaveProposal}
                    />
                )
            case PROPOSAL_WIZARD_STEPS.PUBLISH:
                return (
                    <ProposalPublishStep
                        currentUser={currentUser}
                        proposalStreamID={proposalStreamID}
                    />
                )
            default:
                return (
                    <ProposalDescriptionStep
                        proposalInput={proposalInput}
                        setProposalInput={setProposalInput}
                        stepperCallback={setCurrentStep}
                        onSaveProposal={onSaveProposal}
                    />
                )
        }
    }

    return (
        <>
            <Box
                height={{ min: '90vh' }}
                justify="center"
                width={'xlarge'}
                pad={{ horizontal: 'large' }}
            >
                {/* TODO Wizard Nav <Box direction="row" align="center">
                    <Box border={{ color: 'brand' }} round="xsmall" pad="small">
                        <Text>Description</Text>
                    </Box>
                    <CaretRight size="32" />
                    <Box border={{ color: 'brand' }} round="xsmall" pad="small">
                        <Text>Pricing</Text>
                    </Box>
                    <CaretRight size="32" />
                    <Box border={{ color: 'brand' }} round="xsmall" pad="small">
                        <Text>Solver Configuration</Text>
                    </Box>
                    <CaretRight size="32" />
                    <Box border={{ color: 'brand' }} round="xsmall" pad="small">
                        <Text>Requirements</Text>
                    </Box>
                    <CaretRight size="32" />
                    <Box border={{ color: 'brand' }} round="xsmall" pad="small">
                        <Text>Publish</Text>
                    </Box>
                </Box> */}
                {renderCurrentFormStep()}
            </Box>
        </>
    )
}

export default ProposalWizard
