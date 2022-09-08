import {
    PROPOSAL_WIZARD_STEPS,
    ProposalWizardStepsType,
} from '../ProposalWizard'

import { Box } from 'grommet'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import ProposalFlexInputsForm from '../../forms/ProposalFlexInputsForm'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { SetStateAction } from 'react'

interface ProposalFlexInputsStepProps {
    stepperCallback: (step: ProposalWizardStepsType) => void
    proposalInput: ProposalModel
    setProposalInput: React.Dispatch<SetStateAction<ProposalModel | undefined>>
    onSaveProposal: () => Promise<boolean>
    composition: CompositionModel
}

const ProposalFlexInputsStep = ({
    composition,
    stepperCallback,
    onSaveProposal,
    proposalInput,
    setProposalInput,
}: ProposalFlexInputsStepProps) => (
    <Box height={{ min: '60vh' }}>
        <Box gap="medium">
            <Box pad="xsmall">
                <HeaderTextSection
                    title="Reasonable. Just a few more details"
                    paragraph="Please input the following information to set up the Solver correctly."
                />
            </Box>
            <ProposalFlexInputsForm
                composition={composition}
                proposalInput={proposalInput}
                setProposalInput={setProposalInput}
                onSubmit={async () => {
                    if (await onSaveProposal())
                        stepperCallback(PROPOSAL_WIZARD_STEPS.PUBLISH)
                }}
                submitLabel="Save & Continue"
                onCancel={() => stepperCallback(PROPOSAL_WIZARD_STEPS.PRICING)}
                cancelLabel="Back"
            />
        </Box>
    </Box>
)

export default ProposalFlexInputsStep
