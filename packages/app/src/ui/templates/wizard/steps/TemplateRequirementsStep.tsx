import { Box, Button, Form } from 'grommet'
import { SetStateAction, useState } from 'react'

import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'
import ButtonRowContainer from '@cambrian/app/components/containers/ButtonRowContainer'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { TemplateInputType } from '../../EditTemplateUI'
import TemplateRequirementsForm from '../../forms/TemplateRequirementsForm'
import { useTemplateContext } from '@cambrian/app/hooks/useTemplateContext'

interface TemplateRequirementsStepProps {
    templateInput: TemplateInputType
    setTemplateInput: React.Dispatch<SetStateAction<TemplateInputType>>
    isSaving: boolean
    onSave: () => Promise<void>
    onBack: () => void
}

const TemplateRequirementsStep = ({
    templateInput,
    setTemplateInput,
    isSaving,
    onSave,
    onBack,
}: TemplateRequirementsStepProps) => {
    const { template } = useTemplateContext()

    return (
        <Box>
            <HeaderTextSection
                title="Requirements"
                paragraph="Information to help buyers provide you with exactly what you need to start working on their order."
            />
            {template ? (
                <Form onSubmit={onSave}>
                    <TemplateRequirementsForm
                        templateInput={templateInput}
                        setTemplateInput={setTemplateInput}
                    />
                    <ButtonRowContainer
                        primaryButton={
                            <LoaderButton
                                isLoading={isSaving}
                                size="small"
                                primary
                                label={'Continue'}
                                type="submit"
                            />
                        }
                        secondaryButton={
                            <Button
                                size="small"
                                secondary
                                label={'Back'}
                                onClick={onBack}
                            />
                        }
                    />
                </Form>
            ) : (
                <Box height="medium" gap="medium">
                    <BaseSkeletonBox height={'xxsmall'} width={'100%'} />
                    <BaseSkeletonBox height={'small'} width={'100%'} />
                </Box>
            )}
        </Box>
    )
}

export default TemplateRequirementsStep
