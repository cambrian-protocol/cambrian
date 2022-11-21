import { Box, Button, CheckBox, Form, FormExtendedEvent, Text } from 'grommet'
import { SetStateAction, useState } from 'react'
import {
    TemplateModel,
    TemplatePriceModel,
} from '@cambrian/app/models/TemplateModel'

import AddTokenItem from '@cambrian/app/components/token/AddTokenItem'
import BaseTokenItem from '@cambrian/app/components/token/BaseTokenItem'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import NumberInput from '@cambrian/app/components/inputs/NumberInput'
import RemoveTokenItem from '@cambrian/app/components/token/RemoveTokenItem'
import SelectTokenItem from '@cambrian/app/components/token/SelectTokenItem'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'
import { EditTemplateContextType } from '@cambrian/app/hooks/useEditTemplate'
import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'

interface TemplatePricingFormProps {
    editTemplateContext: EditTemplateContextType
    onSubmit?: () => void
    onCancel?: () => void
    submitLabel?: string
    cancelLabel?: string
}

const TemplatePricingForm = ({
    editTemplateContext,
    onSubmit,
    onCancel,
    submitLabel,
    cancelLabel,
}: TemplatePricingFormProps) => {
    const { template, setTemplate, onSaveTemplate, onResetTemplate } =
        editTemplateContext
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (
        event: FormExtendedEvent<TemplatePriceModel, Element>
    ) => {
        event.preventDefault()
        setIsSubmitting(true)
        onSubmit ? await onSubmit() : await onSaveTemplate()
        setIsSubmitting(false)
    }

    if (!template) {
        return (
            <Box height="large" gap="medium">
                <BaseSkeletonBox height={'xsmall'} width={'100%'} />
                <BaseSkeletonBox height={'xsmall'} width={'100%'} />
            </Box>
        )
    }

    return (
        <>
            <Form<TemplatePriceModel> onSubmit={handleSubmit}>
                <Box gap="medium">
                    <Box
                        pad={{ horizontal: 'xsmall' }}
                        gap="medium"
                        height={{ min: '30vh' }}
                    >
                        <Box
                            border
                            round="xsmall"
                            pad="small"
                            direction="row"
                            align="center"
                            gap="small"
                            justify="between"
                        >
                            <Box flex>
                                <NumberInput
                                    name="amount"
                                    value={template.price.amount}
                                    onChange={(e) =>
                                        setTemplate({
                                            ...template,
                                            price: {
                                                ...template.price,
                                                amount:
                                                    e.target.value === ''
                                                        ? undefined
                                                        : Number(
                                                              e.target.value
                                                          ),
                                            },
                                        })
                                    }
                                />
                            </Box>
                            {template.price.isCollateralFlex ? (
                                <SelectTokenItem
                                    allowAnyPaymentToken
                                    tokenAddress={
                                        template.price.denominationTokenAddress
                                    }
                                    onSelect={(newSelectedToken) => {
                                        const filteredTokens = [
                                            ...template.price.preferredTokens,
                                        ].filter(
                                            (token) =>
                                                token !== newSelectedToken
                                        )
                                        setTemplate({
                                            ...template,
                                            price: {
                                                ...template.price,
                                                denominationTokenAddress:
                                                    newSelectedToken,
                                                preferredTokens: filteredTokens,
                                            },
                                        })
                                    }}
                                />
                            ) : (
                                <BaseTokenItem
                                    tokenAddress={
                                        template.price.denominationTokenAddress
                                    }
                                />
                            )}
                        </Box>
                        {template.price.isCollateralFlex && (
                            <Box gap="small">
                                <Box gap="xsmall">
                                    <Text size="small" color="dark-4">{`${
                                        template.price.allowAnyPaymentToken
                                            ? 'Preferred '
                                            : 'Alternative '
                                    }tokens which can be used for payment`}</Text>
                                    <Box
                                        border
                                        round="xsmall"
                                        pad="small"
                                        direction="row"
                                        wrap
                                    >
                                        {template.price.preferredTokens.map(
                                            (preferredToken) => (
                                                <RemoveTokenItem
                                                    key={preferredToken}
                                                    tokenAddress={
                                                        preferredToken
                                                    }
                                                    onRemove={(
                                                        removedToken
                                                    ) => {
                                                        const filteredTokens = [
                                                            ...template.price
                                                                .preferredTokens,
                                                        ].filter(
                                                            (token) =>
                                                                token !==
                                                                removedToken
                                                        )
                                                        setTemplate({
                                                            ...template,
                                                            price: {
                                                                ...template.price,
                                                                preferredTokens:
                                                                    filteredTokens,
                                                            },
                                                        })
                                                    }}
                                                />
                                            )
                                        )}
                                        <AddTokenItem
                                            addedTokens={template.price.preferredTokens.concat(
                                                template.price
                                                    .denominationTokenAddress
                                            )}
                                            onAddToken={(newToken) => {
                                                const updatedPreferredTokens = [
                                                    ...template.price
                                                        .preferredTokens,
                                                ]
                                                updatedPreferredTokens.push(
                                                    newToken
                                                )
                                                setTemplate({
                                                    ...template,
                                                    price: {
                                                        ...template.price,
                                                        preferredTokens:
                                                            updatedPreferredTokens,
                                                    },
                                                })
                                            }}
                                        />
                                    </Box>
                                </Box>
                                <CheckBox
                                    checked={
                                        template.price.allowAnyPaymentToken
                                    }
                                    onChange={(e) => {
                                        setTemplate({
                                            ...template,
                                            price: {
                                                ...template.price,
                                                allowAnyPaymentToken:
                                                    e.target.checked,
                                            },
                                        })
                                    }}
                                    label="Allow any token for payment"
                                />
                            </Box>
                        )}
                    </Box>
                    <TwoButtonWrapContainer
                        primaryButton={
                            <LoaderButton
                                isLoading={isSubmitting}
                                size="small"
                                primary
                                label={submitLabel || 'Save'}
                                type="submit"
                            />
                        }
                        secondaryButton={
                            <Button
                                size="small"
                                secondary
                                label={cancelLabel || 'Reset all changes'}
                                onClick={onCancel ? onCancel : onResetTemplate}
                            />
                        }
                    />
                </Box>
            </Form>
        </>
    )
}

export default TemplatePricingForm
