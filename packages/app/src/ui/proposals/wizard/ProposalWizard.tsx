import { SetStateAction, useContext, useEffect, useState } from 'react'

import { Box } from 'grommet'
import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import ProposalDescriptionStep from './steps/ProposalDescriptionStep'
import ProposalFlexInputsStep from './steps/ProposalFlexInputsStep'
import ProposalPricingStep from './steps/ProposalPricingStep'
import ProposalPublishStep from './steps/ProposalPublishStep'
import { ProposalStackType } from '@cambrian/app/store/ProposalContext'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { TopRefContext } from '@cambrian/app/store/TopRefContext'

interface ProposalWizardProps {
    proposalInput: CeramicProposalModel
    setProposalInput: React.Dispatch<
        SetStateAction<CeramicProposalModel | undefined>
    >
    onSaveProposal: () => Promise<void>
    proposalStack: ProposalStackType
    proposalStreamDoc: TileDocument<CeramicProposalModel>
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
    proposalStack,
    proposalStreamDoc,
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
                        requirements={proposalStack.template.requirements}
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
                        template={proposalStack.template}
                    />
                )
            case PROPOSAL_WIZARD_STEPS.FLEX_INPUTS:
                return (
                    <ProposalFlexInputsStep
                        stepperCallback={setCurrentStep}
                        proposalInput={proposalInput}
                        setProposalInput={setProposalInput}
                        onSaveProposal={onSaveProposal}
                        composition={proposalStack.composition}
                    />
                )
            case PROPOSAL_WIZARD_STEPS.PUBLISH:
                return (
                    <ProposalPublishStep
                        proposalStreamDoc={proposalStreamDoc}
                    />
                )
            default:
                return <></>
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
