import {
    PROPOSAL_WIZARD_STEPS,
    ProposalWizardStepsType,
} from '../ProposalWizard'
import { useEffect, useState } from 'react'

import API from '@cambrian/app/services/api/cambrian.api'
import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'
import { Box } from 'grommet'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import Proposal from '@cambrian/app/classes/stages/Proposal'
import ProposalFlexInputsForm from '../../forms/ProposalFlexInputsForm'
import { useProposalContext } from '@cambrian/app/hooks/useProposalContext'

interface ProposalFlexInputsStepProps {
    stepperCallback: (step: ProposalWizardStepsType) => void
}

const ProposalFlexInputsStep = ({
    stepperCallback,
}: ProposalFlexInputsStepProps) => {
    const { proposal } = useProposalContext()

    const [compositionContent, setCompositionContent] =
        useState<CompositionModel>()

    useEffect(() => {
        if (proposal) initComposition(proposal)
    }, [proposal])

    const initComposition = async (_proposal: Proposal) => {
        try {
            const _compositionDoc = await API.doc.readCommit<CompositionModel>(
                _proposal.templateDoc.content.composition.streamID,
                _proposal.templateDoc.content.composition.commitID
            )

            if (!_compositionDoc)
                throw new Error(
                    'Commit read error: failed to load Composition Commit'
                )

            setCompositionContent(_compositionDoc.content)
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <Box>
            <HeaderTextSection
                title="Reasonable. Just a few more details"
                paragraph="Please input the following information to set up the Solver correctly."
            />
            {proposal && compositionContent ? (
                <ProposalFlexInputsForm
                    proposal={proposal}
                    compositionContent={compositionContent}
                    onSubmit={() =>
                        stepperCallback(PROPOSAL_WIZARD_STEPS.PUBLISH)
                    }
                    submitLabel="Save & Continue"
                    onCancel={() =>
                        stepperCallback(PROPOSAL_WIZARD_STEPS.PRICING)
                    }
                    cancelLabel="Back"
                />
            ) : (
                <Box height="medium" gap="medium">
                    <BaseSkeletonBox height={'xxsmall'} width={'100%'} />
                    <BaseSkeletonBox height={'xxsmall'} width={'100%'} />
                </Box>
            )}
        </Box>
    )
}

export default ProposalFlexInputsStep
