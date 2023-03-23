import { Box, Button, Form } from 'grommet'
import { SetStateAction, useState } from 'react'

import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'
import ButtonRowContainer from '@cambrian/app/components/containers/ButtonRowContainer'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { TemplateInputType } from '../../EditTemplateUI'
import TemplatePricingForm from '../../forms/TemplatePricingForm'
import { useTemplateContext } from '@cambrian/app/hooks/useTemplateContext'

interface TemplatePricingStepProps {
    templateInput: TemplateInputType
    setTemplateInput: React.Dispatch<SetStateAction<TemplateInputType>>
    isSaving: boolean
    onSave: () => Promise<void>
    onBack: () => void
}

const TemplatePricingStep = ({
    templateInput,
    setTemplateInput,
    isSaving,
    onSave,
    onBack,
}: TemplatePricingStepProps) => {
    const { template } = useTemplateContext()

    return (
        <Box>
            <HeaderTextSection
                title="How much does it cost?"
                paragraph="If the price is variable, provide a baseline. It can be negotiated with customers later."
            />
            {template ? (
                <Form onSubmit={onSave}>
                    <TemplatePricingForm
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
                <Box height="large" gap="medium">
                    <BaseSkeletonBox height={'xxsmall'} width={'100%'} />
                    <BaseSkeletonBox height={'small'} width={'100%'} />
                </Box>
            )}
        </Box>
    )
}

export default TemplatePricingStep
