import {
    PROPOSAL_WIZARD_STEPS,
    ProposalWizardStepsType,
} from '../ProposalWizard'

import { Box } from 'grommet'
import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import ProposalFlexInputsForm from '../../forms/ProposalFlexInputsForm'
import { SetStateAction } from 'react'

interface ProposalFlexInputsStepProps {
    stepperCallback: (step: ProposalWizardStepsType) => void
    proposalInput: CeramicProposalModel
    setProposalInput: React.Dispatch<
        SetStateAction<CeramicProposalModel | undefined>
    >
    onSaveProposal: () => Promise<void>
    composition: CompositionModel
}

const ProposalFlexInputsStep = ({
    stepperCallback,
    proposalInput,
    setProposalInput,
    onSaveProposal,
    composition,
}: ProposalFlexInputsStepProps) => {
    return (
        <Box height={{ min: '60vh' }}>
            <Box gap="medium">
                <HeaderTextSection
                    title="Reasonable. Just a few more details"
                    paragraph="Please input the following information to set up the Solver correctly."
                />
                <ProposalFlexInputsForm
                    proposalInput={proposalInput}
                    setProposalInput={setProposalInput}
                    onSubmit={async () => {
                        await onSaveProposal()
                        stepperCallback(PROPOSAL_WIZARD_STEPS.PUBLISH)
                    }}
                    submitLabel="Save & Continue"
                    onCancel={() =>
                        stepperCallback(PROPOSAL_WIZARD_STEPS.PRICING)
                    }
                    cancelLabel="Back"
                    composition={composition}
                />
            </Box>
        </Box>
    )
}

export default ProposalFlexInputsStep
