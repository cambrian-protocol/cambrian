import {
    TEMPLATE_WIZARD_STEPS,
    TemplateWizardStepsType,
} from '../TemplateWizard'
import { useEffect, useState } from 'react'

import API from '@cambrian/app/services/api/cambrian.api'
import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'
import { Box } from 'grommet'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import Template from '@cambrian/app/classes/stages/Template'
import TemplateFlexInputsForm from '../../forms/TemplateFlexInputsForm'
import { useTemplateContext } from '@cambrian/app/hooks/useTemplateContext'

interface TemplateFlexInputsStepProps {
    stepperCallback: (step: TemplateWizardStepsType) => void
}

const TemplateFlexInputsStep = ({
    stepperCallback,
}: TemplateFlexInputsStepProps) => {
    const { template } = useTemplateContext()
    const [compositionContent, setCompositionContent] =
        useState<CompositionModel>()

    useEffect(() => {
        if (template) initComposition(template)
    }, [template])

    const initComposition = async (template: Template) => {
        try {
            const _compositionDoc = await API.doc.readCommit<CompositionModel>(
                template.content.composition.streamID,
                template?.content.composition.commitID
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
                title="Solver Config"
                paragraph="Configure the Solver by completing these fields as instructed."
            />
            {template && compositionContent ? (
                <TemplateFlexInputsForm
                    template={template}
                    compositionContent={compositionContent}
                    onSubmit={() =>
                        stepperCallback(TEMPLATE_WIZARD_STEPS.REQUIREMENTS)
                    }
                    submitLabel="Save & Continue"
                    onCancel={() =>
                        stepperCallback(TEMPLATE_WIZARD_STEPS.PRICING)
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

export default TemplateFlexInputsStep
