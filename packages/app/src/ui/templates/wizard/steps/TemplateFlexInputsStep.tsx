import { Box, Button, Form } from 'grommet'
import { SetStateAction, useState } from 'react'

import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'
import ButtonRowContainer from '@cambrian/app/components/containers/ButtonRowContainer'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import TemplateFlexInputsForm from '../../forms/TemplateFlexInputsForm'
import { TemplateInputType } from '../../EditTemplateUI'
import { useTemplateContext } from '@cambrian/app/hooks/useTemplateContext'

interface TemplateFlexInputsStepProps {
    templateInput: TemplateInputType
    setTemplateInput: React.Dispatch<SetStateAction<TemplateInputType>>
    isSaving: boolean
    onSave: () => Promise<void>
    onBack: () => void
}

const TemplateFlexInputsStep = ({
    templateInput,
    setTemplateInput,
    isSaving,
    onSave,
    onBack,
}: TemplateFlexInputsStepProps) => {
    const { template } = useTemplateContext()

    return (
        <Box>
            <HeaderTextSection
                title="Solver Config"
                paragraph="Configure the Solver by completing these fields as instructed."
            />
            {template ? (
                <Form onSubmit={onSave}>
                    <TemplateFlexInputsForm
                        template={template}
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
                    <BaseSkeletonBox height={'xxsmall'} width={'100%'} />
                </Box>
            )}
        </Box>
    )
}

export default TemplateFlexInputsStep
