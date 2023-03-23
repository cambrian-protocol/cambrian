import { Box, Button, Form } from 'grommet'
import { SetStateAction, useState } from 'react'

import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'
import ButtonRowContainer from '@cambrian/app/components/containers/ButtonRowContainer'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import TemplateDescriptionForm from '../../forms/TemplateDescriptionForm'
import { TemplateInputType } from '../../EditTemplateUI'
import _ from 'lodash'
import { useRouter } from 'next/router'
import { useTemplateContext } from '@cambrian/app/hooks/useTemplateContext'

interface TemplateDescriptionStepProps {
    templateInput: TemplateInputType
    setTemplateInput: React.Dispatch<SetStateAction<TemplateInputType>>
    onSave: () => Promise<void>
}

const TemplateDescriptionStep = ({
    templateInput,
    setTemplateInput,
    onSave,
}: TemplateDescriptionStepProps) => {
    const router = useRouter()
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
                title={`What service are you offering?`}
                paragraph="Let the world know how you can help."
            />
            {template ? (
                <Form onSubmit={onSubmit}>
                    <TemplateDescriptionForm
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
                                label={'Cancel'}
                                onClick={() =>
                                    router.push(
                                        `${window.location.origin}/dashboard?idx=1`
                                    )
                                }
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

export default TemplateDescriptionStep
