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
import useEditProposal, {
    EditProposalContextType,
} from '@cambrian/app/hooks/useEditProposal'

interface ProposalFlexInputsStepProps {
    editProposalContext: EditProposalContextType
    stepperCallback: (step: ProposalWizardStepsType) => void
}

const ProposalFlexInputsStep = ({
    editProposalContext,
    stepperCallback,
}: ProposalFlexInputsStepProps) => {
    const { onSaveProposal } = editProposalContext
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
                    editProposalContext={editProposalContext}
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
