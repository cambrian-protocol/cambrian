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
    onSave: () => Promise<void>
    onBack: () => void
}

const TemplatePricingStep = ({
    templateInput,
    setTemplateInput,
    onSave,
    onBack,
}: TemplatePricingStepProps) => {
    const { template } = useTemplateContext()

    const [isSubmitting, setIsSubmitting] = useState(false)

    const onSubmit = async () => {
        setIsSubmitting(true)
        await onSave()
        setIsSubmitting(false)
    }

    return (
        <Box>
            <HeaderTextSection
                title="How much does it cost?"
                paragraph="If the price is variable, provide a baseline. It can be negotiated with customers later."
            />
            {template ? (
                <Form onSubmit={onSubmit}>
                    <TemplatePricingForm
                        templateInput={templateInput}
                        setTemplateInput={setTemplateInput}
                    />
                    <ButtonRowContainer
                        primaryButton={
                            <LoaderButton
                                isLoading={isSubmitting}
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
