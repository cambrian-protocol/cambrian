import {
    PROPOSAL_WIZARD_STEPS,
    ProposalWizardStepsType,
} from '../ProposalWizard'

import { Box } from 'grommet'
import { EditProposalType } from '@cambrian/app/hooks/useEditProposal'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import ProposalFlexInputsForm from '../../forms/ProposalFlexInputsForm'

interface ProposalFlexInputsStepProps {
    editProposalProps: EditProposalType
    stepperCallback: (step: ProposalWizardStepsType) => void
}

const ProposalFlexInputsStep = ({
    editProposalProps,
    stepperCallback,
}: ProposalFlexInputsStepProps) => {
    const { onSaveProposal } = editProposalProps
    return (
        <Box height={{ min: '60vh' }}>
            <Box gap="medium">
                <Box pad="xsmall">
                    <HeaderTextSection
                        title="Reasonable. Just a few more details"
                        paragraph="Please input the following information to set up the Solver correctly."
                    />
                </Box>
                <ProposalFlexInputsForm
                    editProposalProps={editProposalProps}
                    onSubmit={async () => {
                        if (await onSaveProposal())
                            stepperCallback(PROPOSAL_WIZARD_STEPS.PUBLISH)
                    }}
                    submitLabel="Save & Continue"
                    onCancel={() =>
                        stepperCallback(PROPOSAL_WIZARD_STEPS.PRICING)
                    }
                    cancelLabel="Back"
                />
            </Box>
        </Box>
    )
}

export default ProposalFlexInputsStep
