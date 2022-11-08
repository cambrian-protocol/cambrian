import { Box, Button, CheckBox, Form, FormExtendedEvent, Text } from 'grommet'
import { SetStateAction, useState } from 'react'
import {
    TemplateModel,
    TemplatePriceModel,
} from '@cambrian/app/models/TemplateModel'

import AddTokenItem from '@cambrian/app/components/token/AddTokenItem'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import NumberInput from '@cambrian/app/components/inputs/NumberInput'
import RemoveTokenItem from '@cambrian/app/components/token/RemoveTokenItem'
import SelectTokenItem from '@cambrian/app/components/token/SelectTokenItem'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'

interface TemplatePricingFormProps {
    templateInput: TemplateModel
    setTemplateInput: React.Dispatch<SetStateAction<TemplateModel | undefined>>
    onSubmit: () => Promise<void>
    submitLabel?: string
    onCancel: () => void
    cancelLabel?: string
}

const TemplatePricingForm = ({
    onSubmit,
    templateInput,
    setTemplateInput,
    submitLabel,
    onCancel,
    cancelLabel,
}: TemplatePricingFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (
        event: FormExtendedEvent<TemplatePriceModel, Element>
    ) => {
        event.preventDefault()
        setIsSubmitting(true)
        await onSubmit()
        setIsSubmitting(false)
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
                                    value={templateInput.price.amount}
                                    onChange={(e) =>
                                        setTemplateInput({
                                            ...templateInput,
                                            price: {
                                                ...templateInput.price,
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
                            <SelectTokenItem
                                allowAnyPaymentToken
                                tokenAddress={
                                    templateInput.price.denominationTokenAddress
                                }
                                onSelect={(newSelectedToken) => {
                                    const filteredTokens = [
                                        ...templateInput.price.preferredTokens,
                                    ].filter(
                                        (token) => token !== newSelectedToken
                                    )
                                    setTemplateInput({
                                        ...templateInput,
                                        price: {
                                            ...templateInput.price,
                                            denominationTokenAddress:
                                                newSelectedToken,
                                            preferredTokens: filteredTokens,
                                        },
                                    })
                                }}
                            />
                        </Box>
                        <Box gap="xsmall">
                            <Text size="small" color="dark-4">{`${
                                templateInput.price.allowAnyPaymentToken
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
                                {templateInput.price.preferredTokens.map(
                                    (preferredToken) => (
                                        <RemoveTokenItem
                                            key={preferredToken}
                                            tokenAddress={preferredToken}
                                            onRemove={(removedToken) => {
                                                const filteredTokens = [
                                                    ...templateInput.price
                                                        .preferredTokens,
                                                ].filter(
                                                    (token) =>
                                                        token !== removedToken
                                                )
                                                setTemplateInput({
                                                    ...templateInput,
                                                    price: {
                                                        ...templateInput.price,
                                                        preferredTokens:
                                                            filteredTokens,
                                                    },
                                                })
                                            }}
                                        />
                                    )
                                )}
                                <AddTokenItem
                                    addedTokens={templateInput.price.preferredTokens.concat(
                                        templateInput.price
                                            .denominationTokenAddress
                                    )}
                                    onAddToken={(newToken) => {
                                        const updatedPreferredTokens = [
                                            ...templateInput.price
                                                .preferredTokens,
                                        ]
                                        updatedPreferredTokens.push(newToken)
                                        setTemplateInput({
                                            ...templateInput,
                                            price: {
                                                ...templateInput.price,
                                                preferredTokens:
                                                    updatedPreferredTokens,
                                            },
                                        })
                                    }}
                                />
                            </Box>
                        </Box>
                        <CheckBox
                            checked={templateInput.price.allowAnyPaymentToken}
                            onChange={(e) => {
                                setTemplateInput({
                                    ...templateInput,
                                    price: {
                                        ...templateInput.price,
                                        allowAnyPaymentToken: e.target.checked,
                                    },
                                })
                            }}
                            label="Allow any token for payment"
                        />
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
                                onClick={onCancel}
                            />
                        }
                    />
                </Box>
            </Form>
        </>
    )
}

export default TemplatePricingForm
